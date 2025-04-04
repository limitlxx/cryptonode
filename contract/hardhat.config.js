/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-ethers");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: [process.env.SEPOLIA_PRIVATE_KEY],
      chainId: 11155111 // Sepolia's chain ID
    },
    hardhat: {
      // For local testing without forking
      chainId: 11155111 // Sepolia's chain ID
    }
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test"
  },
  settings: {
    remappings: [
      "@openzeppelin/contracts/=node_modules/@openzeppelin/contracts/",
      "@aave/core-v3/=node_modules/@aave/core-v3/"
    ]
  }
};