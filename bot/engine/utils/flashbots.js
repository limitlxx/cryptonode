module.exports = {
    getFlashbotsProvider: async (web3) => {
      return {
        sendPrivateTransaction: async (opportunity) => {
          console.log('Sending via Flashbots:', opportunity);
          return true;
        }
      };
    }
  };