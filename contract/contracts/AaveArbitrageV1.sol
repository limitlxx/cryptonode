// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@aave/core-v3/contracts/flashloan/base/FlashLoanSimpleReceiverBase.sol";
import "@aave/core-v3/contracts/interfaces/IPoolAddressesProvider.sol"; 

import "hardhat/console.sol";

interface IDexRouter {
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);

    function getAmountsOut(
        uint amountIn,
        address[] calldata path
    ) external view returns (uint[] memory amounts);
}

contract AaveArbitrageV1 is FlashLoanSimpleReceiverBase, Ownable, ReentrancyGuard {

    // Configuration state
    bool public isPaused;
    uint256 public minProfitThreshold; 
    uint256 public minSpreadThreshold; 
    mapping(string => address) public dexRouters;

    // Events
    event ArbitrageExecuted(
        address indexed token,
        uint256 amount,
        uint256 profit,
        uint256 timestamp
    );
    event ProfitThresholdUpdated(uint256 newThreshold);
    event DexRouterUpdated(string indexed dex, address router);
    event FeesUpdated(uint256 percentage); 
    event OperationFailed(string reason);
    event TokensRescued(address indexed token, uint256 amount);

    modifier whenActive() {
        require(!isPaused, "Contract paused");
        _;
    }

    constructor(
        address _aaveProvider,
        uint256 _minProfit,
        uint256 _minSpread
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_aaveProvider)) Ownable(msg.sender) payable {
        minProfitThreshold = _minProfit;
        minSpreadThreshold = _minSpread;
    }

    // Core Execution Flow
    function executeArbitrage(
        address _token,
        uint256 _amount,
        string calldata _sourceDex,
        string calldata _targetDex,
        address[] calldata _path,
        uint256 _minReturn
    ) external onlyOwner whenActive nonReentrant {
        _validateExecution(_path, _sourceDex, _targetDex);
        
        POOL.flashLoanSimple(
            address(this),
            _token,
            _amount,
            abi.encode(_sourceDex, _targetDex, _path, _minReturn),
            0
        );
    }

    // Aave Flash Loan Callback  
    function executeOperation(
        address _token,
        uint256 _amount,
        uint256 _premium,
        address _initiator,
        bytes calldata _params
    ) external override nonReentrant returns (bool) {
        require(msg.sender == address(POOL), "Unauthorized caller");
        
        uint256 initialBalance = IERC20(_token).balanceOf(address(this));
        // console.log("Current wallet Balance:", initialBalance);
        (string memory sourceDex, string memory targetDex, address[] memory path, uint256 minReturn) = 
            abi.decode(_params, (string, string, address[], uint256));

        try this._executeWithTryCatch(sourceDex, targetDex, path, _amount, minReturn) {
            // Process profit FIRST
            _processProfit(_token, _amount, _premium, initialBalance);
            
            return true;
        } catch Error(string memory reason) {
                emit OperationFailed(reason);
                return false;
            } catch {
                emit OperationFailed("Unknown error");
                return false;
            }

    }

    function _executeWithTryCatch(
        string memory sourceDex,
        string memory targetDex,
        address[] memory path,
        uint256 amount,
        uint256 minReturn
    ) external {
        require(msg.sender == address(this), "Internal call only");
        _executeArbitrageTrades(sourceDex, targetDex, path, amount, minReturn);
    }

    // Profit Simulation
    function simulateArbitrage(
        address _token,
        uint256 _amount,
        string calldata _sourceDex,
        string calldata _targetDex,
        address[] calldata _path
    ) external view returns (
        bool profitable, 
        uint256 potentialProfit, 
        uint256 spreadBP
    ) {
        _validateExecution(_path, _sourceDex, _targetDex);
        require(_path[0] == _token, "First token must be borrowed token");

        uint256 flashCost = _amount + _aaveFee(_amount);
        uint256 simulatedOut = _simulateSwap(_sourceDex, _amount, _path);
        simulatedOut = _simulateSwap(_targetDex, simulatedOut, _reversePath(_path));
        
        return _calculateProfitability(simulatedOut, flashCost, _amount);
    }

    // Management Functions
    function configureDex(string calldata _dexName, address _router) external onlyOwner {
        require(_router != address(0), "Invalid router address");
        dexRouters[_dexName] = _router;
        emit DexRouterUpdated(_dexName, _router);
    }

    function setProfitThresholds(uint256 _profit, uint256 _spread) external onlyOwner {
        minProfitThreshold = _profit;
        minSpreadThreshold = _spread;
        emit ProfitThresholdUpdated(_profit);
    }

    // Internal Logic
    function _executeArbitrageTrades(
        string memory _sourceDex,
        string memory _targetDex,
        address[] memory _path,
        uint256 _amount,
        uint256 _minReturn
    ) internal {
        address sourceRouter = dexRouters[_sourceDex];
        address targetRouter = dexRouters[_targetDex];
        
        _executeSwap(sourceRouter, _path, _amount, 0);
        uint256 intermediateAmount = IERC20(_path[1]).balanceOf(address(this));
        // console.log("Mid-process TB balance 1:", intermediateAmount);

        _executeSwap(targetRouter, _reversePath(_path), intermediateAmount, _minReturn);        
        // console.log("Mid-process TB balance 0:", intermediateAmount);
    }

    function _executeSwap(
        address _router,
        address[] memory _path,
        uint256 _amountIn,
        uint256 _minOut
    ) internal {
        IERC20(_path[0]).approve(_router, _amountIn);
        IDexRouter(_router).swapExactTokensForTokens(
            _amountIn,
            _minOut,
            _path,
            address(this),
            block.timestamp
        );
    }

    function _processProfit(
        address _token,
        uint256 _borrowed,
        uint256 _premium,
        uint256 _initialBalance // Now correctly represents pre-trade balance
    ) internal {
        console.log("\n=== Processing Profit ===");
        console.log("Initial balance:", _initialBalance);
        console.log("Borrowed amount:", _borrowed);
        console.log("Premium amount:", _premium);
        uint256 finalBalance = IERC20(_token).balanceOf(address(this));
        
        uint256 totalOwed = _borrowed + _premium;

        // FIRST: Approve repayment
        IERC20(_token).approve(address(POOL), totalOwed);
        
        // Validate sufficient funds for repayment
        require(finalBalance >= totalOwed, "Insufficient repayment");
        
        // Calculate actual profit
        uint256 grossProfit = finalBalance - totalOwed;
        
        // Ensure profit is above minimum threshold
        require(grossProfit >= minProfitThreshold, "Profit below minimum");       
        emit ArbitrageExecuted(_token, _borrowed, grossProfit, block.timestamp);
    }

    // Validation & Simulation Helpers
   function _validateExecution(
        address[] calldata _path,
        string calldata _sourceDex,
        string calldata _targetDex
    ) internal view {
        require(_path.length == 2, "Simple arbitrage path only");
        require(dexRouters[_sourceDex] != address(0), "Source DEX not configured");
        require(dexRouters[_targetDex] != address(0), "Target DEX not configured");
    }

    function _calculateProfitability(
        uint256 _finalAmount,
        uint256 _totalCost,
        uint256 _principal
    ) internal view returns (bool, uint256, uint256) {
        uint256 profit = _finalAmount > _totalCost ? _finalAmount - _totalCost : 0;
        uint256 spread = ((_finalAmount - _totalCost) * 10000) / _principal;
        
        return (
            profit >= minProfitThreshold && spread >= minSpreadThreshold,
            profit,
            spread
        );
    }

    function _aaveFee(uint256 _amount) internal pure returns (uint256) {
        return (_amount * 9) / 10000; // 0.09% Aave V3 fee
    }

    function _reversePath(address[] memory _path) internal pure returns (address[] memory) {
        address[] memory reversed = new address[](_path.length);
        for(uint i; i < _path.length; i++) {
            reversed[i] = _path[_path.length - 1 - i];
        }
        return reversed;
    }

    function _simulateSwap(
        string calldata _dex,
        uint256 _amountIn,
        address[] memory _path
    ) internal view returns (uint256) {
        address router = dexRouters[_dex];
        require(router != address(0), "DEX not configured");
        return IDexRouter(router).getAmountsOut(_amountIn, _path)[_path.length - 1];
    }

    // Emergency functions
    function rescueTokens(address _token, uint256 amount) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 transferAmount = amount > balance ? balance : amount;
        IERC20(_token).transfer(owner(), transferAmount);
        emit TokensRescued(_token, transferAmount); // New event for successful rescue
    }

    function togglePause() external onlyOwner {
        isPaused = !isPaused;
    }

     function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    receive() external payable {}
}