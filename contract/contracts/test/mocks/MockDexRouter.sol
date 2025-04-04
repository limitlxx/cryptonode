// MockDexRouter.txt
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MockDexRouter {
    uint256 public amountOut;
    uint256 public amountOutValue;
    address public tokenOut;

    function setAmountOut(uint256 _amountOut) public {
        amountOut = _amountOut;
    }

    function setTokenOut(address _tokenOut) public {
        tokenOut = _tokenOut;
    }

//     function swapExactTokensForTokens(
//     uint amountIn,
//     uint /*amountOutMin*/,
//     address[] calldata path,
//     address to,
//     uint /*deadline*/
// ) external returns (uint[] memory amounts) {
//     // Transfer input tokens from sender
//     IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
    
//     // Transfer output tokens to recipient
//     if (tokenOut != address(0)) {
//         IERC20(tokenOut).transfer(to, amountOut);
//     } else {
//         IERC20(path[1]).transfer(to, amountOut);
//     }

//     amounts = new uint[](2);
//     amounts[0] = amountIn;
//     amounts[1] = amountOut;
//     return amounts;
// }

    // In MockDexRouter.sol
function swapExactTokensForTokens(
    uint amountIn,
    uint /*amountOutMin*/,
    address[] calldata path,
    address to,
    uint /*deadline*/
) external returns (uint[] memory amounts) {
    // 1. Transfer input tokens from sender (arbitrage contract)
    require(
        IERC20(path[0]).transferFrom(msg.sender, address(this), amountIn),
        "Input transfer failed"
    );
    
    // 2. Calculate output amount (using preset amountOut)
    uint amountOut = amountOutValue;
    
    // 3. Transfer output tokens to recipient
    require(
        IERC20(path[1]).transfer(to, amountOut),
        "Output transfer failed"
    );
    
    // Return amounts array
    uint[] memory results = new uint[](2);
    results[0] = amountIn;
    results[1] = amountOut;
    return results;
}

    function getAmountsOut(
        uint amountIn,
        address[] calldata /*path*/
        ) external view returns (uint[] memory amounts) {
            amounts = new uint[](2);
            amounts[0] = amountIn;
            amounts[1] = amountOut;
            return amounts;
        }
}