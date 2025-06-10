module.exports = {
    getPrice: async (tokenA, tokenB) => {
      return {
        dex: 'Sushiswap',
        price: Math.random() * (1.02 - 0.98) + 0.98,
        amount: 1000,
        slippage: Math.random() * 0.005,
      };
    }
  };