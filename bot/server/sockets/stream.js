const runBot = require('../../engine/arbitrage');
const Web3 = require('web3');
const ABI = require('../../abi/contractABI.json');
const config = require('../../config');

module.exports = function (io) {
  io.on('connection', async (socket) => {
    console.log('Client connected');
    const web3 = new Web3(config.chains.sepolia.rpcUrl);
    const contract = new web3.eth.Contract(ABI, '0x2472af3a58C9b0a060300D49772bD62A8e73621d');
    await runBot(web3, contract, socket);
  });
};