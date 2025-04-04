// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract MockAaveAddressesProvider {
    address public immutable pool;
    
    constructor(address _pool) {
        pool = _pool;
    }
    
    function getPool() external view returns (address) {
        return pool;
    }
}