module.exports = {
    minProfitUSD: 50,
    chains: {
      sepolia: {
        rpcUrl: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
        chainId: 11155111,
      },
    },
    tokens: ['USDC', 'USDT', 'DAI', 'AAVE', 'LINK', 'WBTC', 'ETH'],
    gasMultiplier: 1.2,
    slippageTolerance: 0.005, // 0.5% default, updated dynamically
    fileStorePath: './engine/trade-logs.json'
  };