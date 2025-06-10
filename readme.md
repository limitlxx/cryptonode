# Aave Arbitrage V1 Contract Documentation

## Overview
The `AaveArbitrageV1` contract facilitates decentralized exchange (DEX) arbitrage opportunities using Aave's flash loans. It leverages price discrepancies between two DEXs to generate profits, repays the flash loan, and distributes fees. Key features include:

- **Flash Loan Integration**: Borrows assets via Aave V3 for arbitrage.
- **DEX Swaps**: Executes token swaps on configured DEX routers (e.g., Uniswap, Sushiswap).
- **Profit Calculations**: Ensures profitability thresholds are met before executing trades.
- **Fee Management**: Deducts a percentage of profits as fees.
- **Safety Measures**: Includes reentrancy guards, pausing, and ownership controls.

## Key Components

### Inherited Contracts
- **`FlashLoanSimpleReceiverBase`**: Handles Aave flash loan logic.
- **`Ownable`**: Restricts critical functions to the owner.
- **`ReentrancyGuard`**: Prevents reentrancy attacks.

### State Variables
- **`isPaused`**: Toggles contract activity.
- **`minProfitThreshold`**: Minimum profit required to execute arbitrage.
- **`minSpreadThreshold`**: Minimum spread (in basis points) for profitable opportunities. 
- **`dexRouters`**: Maps DEX names (e.g., "Uniswap") to router addresses.

### Functions

#### Core Functions
1. **`executeArbitrage`**: 
   - Initiates a flash loan for arbitrage.
   - Parameters: Token, amount, source/target DEX names, swap path, minimum return.
   - Restricted to the owner; non-reentrant and active.

2. **`executeOperation` (Callback)**:
   - Executes swaps post-flash loan.
   - Validates initiator, decodes parameters, processes profit, and repays the loan.

3. **`simulateArbitrage`**:
   - Simulates arbitrage to check profitability.
   - Returns `(profitable, potentialProfit, spreadBP)`.

#### Management Functions
- **`configureDex`**: Maps a DEX name to its router address (owner-only).
- **`updateFeeStructure`**: Updates fee collector and percentage (owner-only).
- **`setProfitThresholds`**: Adjusts profit and spread thresholds (owner-only).
- **`togglePause`**: Emergency stop/resume (owner-only).
- **`rescueTokens`**: Recovers accidentally sent tokens (owner-only).

### Internal Logic
- **`_executeArbitrageTrades`**: Swaps tokens on source and target DEXes.
- **`_processProfit`**: Calculates net profit, deducts fees, repays the flash loan.
- **`_validateExecution`**: Checks path validity and DEX configurations.
- **`_simulateSwap`**: Estimates swap output using `getAmountsOut`.

## Workflow
1. **Setup**: Owner configures DEX routers and fee parameters.
2. **Simulation**: `simulateArbitrage` checks if an opportunity meets thresholds.
3. **Execution**: 
   - Flash loan is requested via `executeArbitrage`.
   - `executeOperation` swaps tokens on DEXes, ensuring profit.
   - Profit is calculated, fees deducted, and loan repaid.
4. **Profit Distribution**: Net profit remains in the contract; fees sent to `feeCollector`.

## Safety Considerations
- **Reentrancy Protection**: `nonReentrant` modifier secures critical functions.
- **Threshold Checks**: Ensures minimum profit and spread to avoid losses.
- **Input Validation**: Validates DEX configurations and swap paths.
- **Emergency Features**: Pausing and token rescue functions.

## Usage Example
1. **Configure DEXes**:
   ```solidity
   configureDex("Uniswap", 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
   configureDex("Sushiswap", 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F);
   ```

2. **Simulate Arbitrage**:
   ```solidity
   simulateArbitrage(
       USDC_ADDRESS,
       1000000, // $1M
       "Uniswap",
       "Sushiswap",
       [USDC_ADDRESS, DAI_ADDRESS]
   );
   ```

3. **Execute Arbitrage**:
   ```solidity
   executeArbitrage(
       USDC_ADDRESS,
       1000000,
       "Uniswap",
       "Sushiswap",
       [USDC_ADDRESS, DAI_ADDRESS],
       MIN_RETURN
   );
   ```

## Events
- **`ArbitrageExecuted`**: Emitted on successful arbitrage (token, amount, profit).
- **`ProfitThresholdUpdated`**: Signals updated profit/spread thresholds.
- **`DexRouterUpdated`**: Logs DEX router address changes.
- **`FeesUpdated`**: Indicates fee parameter updates.

## Notes
- **Aave Fees**: 0.09% fee on flash loans (hardcoded in `_aaveFee`).
- **Token Approval**: Ensure the contract has sufficient allowances for DEX routers.
- **Path Reversal**: The target DEX swap uses the reverse path of the source swap.

This contract is designed for advanced users familiar with DeFi arbitrage. Proper simulation and parameter configuration are critical to avoid losses.

# https://github.com/bgd-labs/aave-address-book#usage-with-node
# https://search.onaave.com/
# https://github.com/aave/aave-utilities#data-methods-setup


# Aavev3 eth provider: 0x497a1994c46d4f6C864904A9f1fac6328Cb7C8a6
# polygon provider: 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5
# Arbitrum provider: 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5
# Optimism provider: 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5
# Avalanche provider: 0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5

###
# A_TOKEN
## ETHEREUM
[USDT] 0x23878914EFE38d27C4D67Ab83ed1b93A74D4086a        
[DAI] 0x018008bfb33d285247A21d44E50697654f754e63
[USDC] 0x98C23E9d8f34FEFb1B7BD6a91B7FF122F4e16F5c
[AAVE] 0xA700b4eB416Be35b2911fd5Dee80678ff64fF6C9

https://sepolia.etherscan.io/address/0x2472af3a58C9b0a060300D49772bD62A8e73621d#code

## POLYGON
[USDT] 0x6ab707Aca953eDAeFBc4fD23bA73294241490620
[DAI] 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE
[USDC] 0x625E7708f30cA75bfd92586e17077590C60eb4cD
[AAVE] 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375

## ARBITRUM
[USDT] 0x6ab707Aca953eDAeFBc4fD23bA73294241490620
[DAI] 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE
[USDC] 0x625E7708f30cA75bfd92586e17077590C60eb4cD
[AAVE] 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375

## OPTIMISM
[USDT] 0x6ab707Aca953eDAeFBc4fD23bA73294241490620
[DAI] 0x82E64f49Ed5EC1bC6e43DAD4FC8Af9bb3A2312EE
[USDC] 0x625E7708f30cA75bfd92586e17077590C60eb4cD
[AAVE] 0xf329e36C7bF6E5E86ce2150875a84Ce77f477375


Get started by customizing your environment (defined in the .idx/dev.nix file) with the tools and IDE extensions you'll need for your project!

Learn more at https://developers.google.com/idx/guides/customize-idx-env

Run in your terminal:

bash
Copy
node -e "console.log(require('ethers').Wallet.createRandom().privateKey)"

11000000000000000000
1000000000000000000
900000000000000
10000000000000000000
1000900000000000000

npx hardhat run scripts/deploy.js --network sepolia

Deploying contracts with the account: 0xFE65f2Be4D157b3F0a19d7fBb874D18f2eabeA9F
Account balance: 0.049317801338328753 ETH
Network: sepolia
test address 0x669032cF7b531A2a2C625AA4c5a625d747CdA483

npx hardhat verify --network sepolia 0x669032cF7b531A2a2C625AA4c5a625d747CdA483 \
  "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A" \
  "50000000" \
  "50" 



  arbitrage-2896928:~/arbitrage/hardhat-tutorial$ npx hardhat run scripts/deploy.js --network sepolia
Deploying contracts with the account: 0xFE65f2Be4D157b3F0a19d7fBb874D18f2eabeA9F
Account balance: 0.049306726803977873 ETH
Network: sepolia
Arbitrage contract deployed to: 0x2472af3a58C9b0a060300D49772bD62A8e73621d
Verifying contract...
Verification failed: The address 0x2472af3a58C9b0a060300D49772bD62A8e73621d has no bytecode. Is the contract deployed to this network?
The selected network is sepolia.


npx hardhat flatten contracts/AaveArbitrageV2.sol > flattened.sol

npx hardhat verify --network sepolia \
  --contract contracts/AaveArbitrageV1.sol:AaveArbitrageV1 \
  0x2472af3a58C9b0a060300D49772bD62A8e73621d \
  "0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A" \
  "50000000" \
  "50"