// MockAavePool.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";

contract MockAavePool {
    mapping(address => uint256) public tokenBalances;
    address public callbackContract;
    
    event FlashLoanExecuted(
        address indexed receiver,
        address indexed asset,
        uint256 amount,
        uint256 premium
    );

    function setCallbackContract(address _callback) external {
        callbackContract = _callback;
    }

    function depositToken(address token, uint256 amount) external {
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Deposit transfer failed"
        );
        tokenBalances[token] += amount;
    }

    function flashLoanSimple(
        address receiverAddress,
        address asset,
        uint256 amount,
        bytes calldata params,
        uint16 /*referralCode*/
    ) external {
        console.log("1. Checking pool balance...");
        require(tokenBalances[asset] >= amount, "Insufficient pool balance");
        
        console.log("2. Transferring tokens...");
        require(
            IERC20(asset).transfer(receiverAddress, amount),
            "Initial transfer failed"
        );
        
        console.log("3. Executing callback...");
        uint256 premium = (amount * 9) / 10000; // 0.09% premium
        (bool success, bytes memory result) = receiverAddress.call(
            abi.encodeWithSignature(
                "executeOperation(address,uint256,uint256,address,bytes)",
                asset,
                amount,
                premium,
                msg.sender,
                params
            )
        );
        
        console.log("4. Callback result:", success, string(result));
        require(success, string(abi.encodePacked("Callback failed: ", result)));
        
        console.log("5. Verifying repayment...");
        uint256 repayment = amount + premium;
        uint256 allowance = IERC20(asset).allowance(receiverAddress, address(this));
        console.log("Required repayment:", repayment);
        console.log("Current allowance:", allowance);
        
        require(
            allowance >= repayment,
            "Insufficient allowance for repayment"
        );
        
        console.log("6. Processing repayment...");
        require(
            IERC20(asset).transferFrom(receiverAddress, address(this), repayment),
            "Repayment transfer failed"
        );
        
        tokenBalances[asset] = tokenBalances[asset] - amount + repayment;
        emit FlashLoanExecuted(receiverAddress, asset, amount, premium);
        console.log("7. Flash loan completed");
    }
}