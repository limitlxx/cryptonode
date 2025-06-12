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

contract ImprovedAaveArbitrage is FlashLoanSimpleReceiverBase, Ownable, ReentrancyGuard {

    // Configuration state
    bool public isPaused;
    uint256 public minProfitThreshold; 
    uint256 public minSpreadThreshold;
    uint256 public maxSlippageBP; // in basis points (e.g., 50 = 0.5%)
    uint256 public maxLossThreshold; // Maximum acceptable loss
    uint256 public gasBuffer; // Gas buffer for operations
    
    mapping(string => address) public dexRouters;
    mapping(address => bool) public authorizedCallers;

    // Circuit breaker variables
    uint256 public dailyLossLimit;
    uint256 public currentDayLosses;
    uint256 public lastResetDay;
    
    // Statistics
    uint256 public totalTrades;
    uint256 public totalProfit;
    uint256 public totalLosses;

    // Events
    event ArbitrageExecuted(
        address indexed token,
        uint256 amount,
        uint256 profit,
        string sourceDex,
        string targetDex,
        uint256 timestamp
    );
    event ArbotrageFailed(
        address indexed token,
        uint256 amount,
        uint256 loss,
        string reason,
        uint256 timestamp
    );
    event ProfitThresholdUpdated(uint256 newThreshold);
    event DexRouterUpdated(string indexed dex, address router);
    event SlippageUpdated(uint256 newSlippage);
    event TokensRescued(address indexed token, uint256 amount);
    event CircuitBreakerTriggered(uint256 losses, uint256 limit);
    event AuthorizedCallerUpdated(address indexed caller, bool authorized);

    modifier whenActive() {
        require(!isPaused, "Contract paused");
        _;
    }

    modifier onlyAuthorized() {
        require(authorizedCallers[msg.sender] || msg.sender == owner(), "Unauthorized");
        _;
    }

    modifier circuitBreakerCheck() {
        _checkCircuitBreaker();
        _;
    }

    constructor(
        address _aaveProvider,
        uint256 _minProfit,
        uint256 _minSpread,
        uint256 _maxSlippageBP,
        uint256 _maxLoss,
        uint256 _dailyLossLimit
    ) FlashLoanSimpleReceiverBase(IPoolAddressesProvider(_aaveProvider)) Ownable(msg.sender) payable {
        minProfitThreshold = _minProfit;
        minSpreadThreshold = _minSpread;
        maxSlippageBP = _maxSlippageBP;
        maxLossThreshold = _maxLoss;
        dailyLossLimit = _dailyLossLimit;
        gasBuffer = 200000; // Default gas buffer
        lastResetDay = block.timestamp / 86400; // Reset daily
        
        // Owner is automatically authorized
        authorizedCallers[msg.sender] = true;
    }

    // Core Execution Flow
    function executeArbitrage(
        address _token,
        uint256 _amount,
        string calldata _sourceDex,
        string calldata _targetDex,
        address[] calldata _path,
        uint256 _minReturn
    ) external onlyAuthorized whenActive nonReentrant circuitBreakerCheck {
        _validateExecution(_path, _sourceDex, _targetDex, _amount);
        
        // Pre-check profitability with current market conditions
        (bool profitable, uint256 expectedProfit,) = simulateArbitrage(
            _token, _amount, _sourceDex, _targetDex, _path
        );
        
        require(profitable, "Arbitrage not profitable at current prices");
        require(expectedProfit >= minProfitThreshold, "Expected profit below threshold");
        
        POOL.flashLoanSimple(
            address(this),
            _token,
            _amount,
            abi.encode(_sourceDex, _targetDex, _path, _minReturn, block.timestamp),
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
    ) external override returns (bool) {
        require(msg.sender == address(POOL), "Unauthorized caller");
        require(_initiator == address(this), "Invalid initiator");
        
        uint256 initialBalance = IERC20(_token).balanceOf(address(this));
        console.log("Flash loan received - Amount:", _amount, "Premium:", _premium);
        
        (
            string memory sourceDex, 
            string memory targetDex, 
            address[] memory path, 
            uint256 minReturn,
            uint256 deadline
        ) = abi.decode(_params, (string, string, address[], uint256, uint256));

        // Check if transaction hasn't expired
        require(block.timestamp <= deadline + 300, "Transaction expired"); // 5 min buffer

        uint256 totalOwed = _amount + _premium;
        
        try this._executeArbitrageInternal(
            sourceDex, targetDex, path, _amount, minReturn, _token
        ) returns (bool success) {
            if (success) {
                return _processResult(_token, _amount, _premium, initialBalance, sourceDex, targetDex);
            } else {
                return _handleFailure(_token, _amount, _premium, "Arbitrage execution failed");
            }
        } catch Error(string memory reason) {
            return _handleFailure(_token, _amount, _premium, reason);
        } catch {
            return _handleFailure(_token, _amount, _premium, "Unknown execution error");
        }
    }

    function _executeArbitrageInternal(
        string memory sourceDex,
        string memory targetDex,
        address[] memory path,
        uint256 amount,
        uint256 minReturn,
        address token
    ) external returns (bool) {
        require(msg.sender == address(this), "Internal call only");
        
        address sourceRouter = dexRouters[sourceDex];
        address targetRouter = dexRouters[targetDex];
        
        // Execute first swap
        uint256 initialAmount = IERC20(path[0]).balanceOf(address(this));
        _executeSwap(sourceRouter, path, amount, 0);
        
        // Get intermediate token balance
        uint256 intermediateAmount = IERC20(path[1]).balanceOf(address(this));
        require(intermediateAmount > 0, "First swap failed");
        
        // Calculate minimum output with slippage protection
        uint256 expectedOut = _simulateSwap(targetDex, intermediateAmount, _reversePath(path));
        uint256 minOut = _applySlippageProtection(expectedOut);
        
        // Use the higher of minReturn or calculated minOut
        uint256 finalMinOut = minReturn > minOut ? minReturn : minOut;
        
        // Execute second swap
        _executeSwap(targetRouter, _reversePath(path), intermediateAmount, finalMinOut);
        
        // Verify we have enough to repay
        uint256 finalBalance = IERC20(token).balanceOf(address(this));
        uint256 totalOwed = amount + _aaveFee(amount);
        
        return finalBalance >= totalOwed;
    }

    function _processResult(
        address _token,
        uint256 _borrowed,
        uint256 _premium,
        uint256 _initialBalance,
        string memory _sourceDex,
        string memory _targetDex
    ) internal returns (bool) {
        uint256 finalBalance = IERC20(_token).balanceOf(address(this));
        uint256 totalOwed = _borrowed + _premium;
        
        console.log("Processing result - Final balance:", finalBalance, "Total owed:", totalOwed);
        
        if (finalBalance < totalOwed) {
            uint256 loss = totalOwed - finalBalance;
            return _handleLoss(_token, _borrowed, loss, "Trade resulted in loss");
        }
        
        // Calculate profit
        uint256 grossProfit = finalBalance - totalOwed;
        
        // Approve and ensure repayment
        IERC20(_token).approve(address(POOL), totalOwed);
        
        // Update statistics
        totalTrades++;
        totalProfit += grossProfit;
        
        emit ArbitrageExecuted(
            _token, 
            _borrowed, 
            grossProfit, 
            _sourceDex, 
            _targetDex, 
            block.timestamp
        );
        
        console.log("Arbitrage successful - Profit:", grossProfit);
        return true;
    }

    function _handleFailure(
        address _token,
        uint256 _amount,
        uint256 _premium,
        string memory _reason
    ) internal returns (bool) {
        uint256 totalOwed = _amount + _premium;
        uint256 currentBalance = IERC20(_token).balanceOf(address(this));
        
        if (currentBalance < totalOwed) {
            uint256 loss = totalOwed - currentBalance;
            return _handleLoss(_token, _amount, loss, _reason);
        }
        
        // If we have enough to repay, approve and return false to indicate failure
        IERC20(_token).approve(address(POOL), totalOwed);
        emit ArbotrageFailed(_token, _amount, 0, _reason, block.timestamp);
        return false;
    }

    function _handleLoss(
        address _token,
        uint256 _amount,
        uint256 _loss,
        string memory _reason
    ) internal returns (bool) {
        require(_loss <= maxLossThreshold, "Loss exceeds maximum threshold");
        
        // Update daily losses
        _updateDailyLosses(_loss);
        
        // Update statistics
        totalLosses += _loss;
        
        // We need to cover the shortfall - this should come from contract reserves
        uint256 currentBalance = IERC20(_token).balanceOf(address(this));
        uint256 totalOwed = _amount + _aaveFee(_amount);
        
        require(currentBalance >= totalOwed - _loss, "Insufficient reserves to cover loss");
        
        IERC20(_token).approve(address(POOL), totalOwed);
        
        emit ArbotrageFailed(_token, _amount, _loss, _reason, block.timestamp);
        
        return false; // Return false to indicate the flash loan encountered issues
    }

    // Enhanced Profit Simulation
    function simulateArbitrage(
        address _token,
        uint256 _amount,
        string calldata _sourceDex,
        string calldata _targetDex,
        address[] calldata _path
    ) public view returns (
        bool profitable, 
        uint256 potentialProfit, 
        uint256 spreadBP
    ) {
        _validateSimulation(_path, _sourceDex, _targetDex);
        require(_path[0] == _token, "First token must be borrowed token");

        uint256 flashCost = _amount + _aaveFee(_amount);
        
        // Simulate both swaps with slippage
        uint256 firstSwapOut = _simulateSwap(_sourceDex, _amount, _path);
        uint256 slippageAdjusted1 = _applySlippageProtection(firstSwapOut);
        
        uint256 secondSwapOut = _simulateSwap(_targetDex, slippageAdjusted1, _reversePath(_path));
        uint256 finalAmount = _applySlippageProtection(secondSwapOut);
        
        return _calculateProfitability(finalAmount, flashCost, _amount);
    }

    // Batch simulation for multiple opportunities
    function simulateMultipleArbitrages(
        ArbitrageParams[] calldata params
    ) external view returns (ArbitrageResult[] memory results) {
        results = new ArbitrageResult[](params.length);
        
        for(uint i = 0; i < params.length; i++) {
            (bool profitable, uint256 profit, uint256 spread) = simulateArbitrage(
                params[i].token,
                params[i].amount,
                params[i].sourceDex,
                params[i].targetDex,
                params[i].path
            );
            
            results[i] = ArbitrageResult({
                profitable: profitable,
                potentialProfit: profit,
                spreadBP: spread,
                index: i
            });
        }
        
        return results;
    }

    // Management Functions
    function configureDex(string calldata _dexName, address _router) external onlyOwner {
        require(_router != address(0), "Invalid router address");
        dexRouters[_dexName] = _router;
        emit DexRouterUpdated(_dexName, _router);
    }

    function setAuthorizedCaller(address _caller, bool _authorized) external onlyOwner {
        authorizedCallers[_caller] = _authorized;
        emit AuthorizedCallerUpdated(_caller, _authorized);
    }

    function setProfitThresholds(uint256 _profit, uint256 _spread) external onlyOwner {
        minProfitThreshold = _profit;
        minSpreadThreshold = _spread;
        emit ProfitThresholdUpdated(_profit);
    }

    function setSlippageProtection(uint256 _maxSlippageBP) external onlyOwner {
        require(_maxSlippageBP <= 1000, "Slippage too high"); // Max 10%
        maxSlippageBP = _maxSlippageBP;
        emit SlippageUpdated(_maxSlippageBP);
    }

    function setRiskParameters(
        uint256 _maxLoss,
        uint256 _dailyLossLimit,
        uint256 _gasBuffer
    ) external onlyOwner {
        maxLossThreshold = _maxLoss;
        dailyLossLimit = _dailyLossLimit;
        gasBuffer = _gasBuffer;
    }

    // Internal Logic
    function _executeSwap(
        address _router,
        address[] memory _path,
        uint256 _amountIn,
        uint256 _minOut
    ) internal {
        IERC20(_path[0]).approve(_router, _amountIn);
        
        uint256[] memory amounts = IDexRouter(_router).swapExactTokensForTokens(
            _amountIn,
            _minOut,
            _path,
            address(this),
            block.timestamp + 300 // 5 minute deadline
        );
        
        require(amounts[amounts.length - 1] >= _minOut, "Insufficient output amount");
    }

    function _applySlippageProtection(uint256 _expectedAmount) internal view returns (uint256) {
        return (_expectedAmount * (10000 - maxSlippageBP)) / 10000;
    }

    // Validation & Simulation Helpers
    function _validateExecution(
        address[] calldata _path,
        string calldata _sourceDex,
        string calldata _targetDex,
        uint256 _amount
    ) internal view {
        require(_path.length >= 2 && _path.length <= 4, "Invalid path length");
        require(dexRouters[_sourceDex] != address(0), "Source DEX not configured");
        require(dexRouters[_targetDex] != address(0), "Target DEX not configured");
        require(_amount > 0, "Amount must be positive");
        require(gasleft() >= gasBuffer, "Insufficient gas");
    }

    function _validateSimulation(
        address[] calldata _path,
        string calldata _sourceDex,
        string calldata _targetDex
    ) internal view {
        require(_path.length >= 2 && _path.length <= 4, "Invalid path length");
        require(dexRouters[_sourceDex] != address(0), "Source DEX not configured");
        require(dexRouters[_targetDex] != address(0), "Target DEX not configured");
    }

    function _calculateProfitability(
        uint256 _finalAmount,
        uint256 _totalCost,
        uint256 _principal
    ) internal view returns (bool, uint256, uint256) {
        if (_finalAmount <= _totalCost) {
            return (false, 0, 0);
        }
        
        uint256 profit = _finalAmount - _totalCost;
        uint256 spread = (profit * 10000) / _principal;
        
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
        for(uint i = 0; i < _path.length; i++) {
            reversed[i] = _path[_path.length - 1 - i];
        }
        return reversed;
    }

    function _simulateSwap(
        string memory _dex,
        uint256 _amountIn,
        address[] memory _path
    ) internal view returns (uint256) {
        address router = dexRouters[_dex];
        require(router != address(0), "DEX not configured");
        uint256[] memory amounts = IDexRouter(router).getAmountsOut(_amountIn, _path);
        return amounts[amounts.length - 1];
    }

    // Circuit Breaker Logic
    function _checkCircuitBreaker() internal view {
        uint256 currentDay = block.timestamp / 86400;
        if (currentDay == lastResetDay && currentDayLosses >= dailyLossLimit) {
            revert("Daily loss limit exceeded");
        }
    }

    function _updateDailyLosses(uint256 _loss) internal {
        uint256 currentDay = block.timestamp / 86400;
        
        if (currentDay != lastResetDay) {
            // Reset daily counter
            currentDayLosses = _loss;
            lastResetDay = currentDay;
        } else {
            currentDayLosses += _loss;
            if (currentDayLosses >= dailyLossLimit) {
                emit CircuitBreakerTriggered(currentDayLosses, dailyLossLimit);
            }
        }
    }

    // View Functions
    function getBalance(address _tokenAddress) external view returns (uint256) {
        return IERC20(_tokenAddress).balanceOf(address(this));
    }

    function getStats() external view returns (
        uint256 trades,
        uint256 profits,
        uint256 losses,
        uint256 dailyLosses,
        bool paused
    ) {
        return (totalTrades, totalProfit, totalLosses, currentDayLosses, isPaused);
    }

    function getDexRouter(string calldata _dex) external view returns (address) {
        return dexRouters[_dex];
    }

    // Emergency functions
    function rescueTokens(address _token, uint256 _amount) external onlyOwner {
        uint256 balance = IERC20(_token).balanceOf(address(this));
        uint256 transferAmount = _amount > balance ? balance : _amount;
        require(transferAmount > 0, "No tokens to rescue");
        
        IERC20(_token).transfer(owner(), transferAmount);
        emit TokensRescued(_token, transferAmount);
    }

    function emergencyPause() external onlyOwner {
        isPaused = true;
    }

    function unpause() external onlyOwner {
        isPaused = false;
    }

    function resetDailyLosses() external onlyOwner {
        currentDayLosses = 0;
        lastResetDay = block.timestamp / 86400;
    }

    // Structs for batch operations
    struct ArbitrageParams {
        address token;
        uint256 amount;
        string sourceDex;
        string targetDex;
        address[] path;
    }

    struct ArbitrageResult {
        bool profitable;
        uint256 potentialProfit;
        uint256 spreadBP;
        uint256 index;
    }

 
    receive() external payable {}
}