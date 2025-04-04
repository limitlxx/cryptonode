// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockERC20 is ERC20 {
    constructor(
        string memory name, 
        string memory symbol, 
        uint256 initialSupply,
        address initialHolder  // New parameter
    ) ERC20(name, symbol) {
        _mint(initialHolder, initialSupply);
    }
    
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    // In MockERC20.sol, ensure transfers work:
    function transfer(address to, uint256 amount) public override returns (bool) {
        _transfer(msg.sender, to, amount); // Inherits proper ERC20 logic
        return true;
    }
}