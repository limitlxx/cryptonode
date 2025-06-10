module.exports = {
    getPrice: async (tokenA, tokenB) => {
      return {
        dex: 'Uniswap',
        price: Math.random() * (1.02 - 0.98) + 0.98, // mock
        amount: 1000,
        slippage: Math.random() * 0.005,
      };
    }
  };