const adapters = require('./dexAdapters');
const { estimateGasCost } = require('./utils/gasEstimator');
const { getFlashbotsProvider } = require('./utils/flashbots');
const { saveTradeLog } = require('./utils/fileStore');
const { getDynamicSlippage } = require('./utils/slippage');
const config = require('../config');

const RATE_LIMIT_MS = 10000; // 10s per pair
const pairLastRun = new Map();
const slippageMemo = new Map();

module.exports = async function runBot(web3, contract, socket) {
  const monitorPairs = config.tokens.flatMap((t1) =>
    config.tokens.map((t2) => (t1 !== t2 ? [t1, t2] : null)).filter(Boolean)
  );

  for (const [tokenA, tokenB] of monitorPairs) {
    const key = `${tokenA}-${tokenB}`;
    const now = Date.now();

    if (pairLastRun.has(key) && now - pairLastRun.get(key) < RATE_LIMIT_MS) continue;
    pairLastRun.set(key, now);

    try {
      const prices = await Promise.allSettled([
        adapters.uniswap.getPrice(tokenA, tokenB),
        adapters.sushiswap.getPrice(tokenA, tokenB),
        adapters.curve.getPrice(tokenA, tokenB),
        adapters.balancer.getPrice(tokenA, tokenB),
      ]);

      const validPrices = prices
        .filter((p) => p.status === 'fulfilled' && p.value && p.value.price > 0)
        .map((p) => p.value);

      if (validPrices.length < 2) continue; // Need at least 2 valid sources

      const opportunity = findBestOpportunity(validPrices, tokenA, tokenB);
      if (!opportunity || opportunity.profitUSD < config.minProfitUSD) continue;

      const gasCost = await estimateGasCost(opportunity);
      const slipKey = `${tokenA}-${tokenB}`;
      const dynamicSlippage = slippageMemo.get(slipKey) || await getDynamicSlippage(tokenA, tokenB);
      slippageMemo.set(slipKey, dynamicSlippage);

      if (opportunity.profitUSD > gasCost.usd && opportunity.slippage < dynamicSlippage) {
        const success = await simulateAndExecute(web3, contract, opportunity);
        const result = { tokenA, tokenB, ...opportunity, executed: success };
        saveTradeLog(result);
        socket.emit('newOpportunity', result);
      }
    } catch (err) {
      console.error(`[ERROR] ${tokenA}/${tokenB} arbitrage loop:`, err.message);
    }
  }
};

function findBestOpportunity(prices, tokenA, tokenB) {
  let best = null;
  for (let i = 0; i < prices.length; i++) {
    for (let j = 0; j < prices.length; j++) {
      if (i === j) continue;

      const priceBuy = prices[j].price;
      const priceSell = prices[i].price;

      const spread = priceSell / priceBuy - 1;
      const profitUSD = spread * prices[j].amount * priceBuy;
      const slippage = Math.abs(prices[i].slippage) + Math.abs(prices[j].slippage);

      if (!best || profitUSD > best.profitUSD) {
        best = {
          buyFrom: prices[j].dex,
          sellTo: prices[i].dex,
          priceBuy,
          priceSell,
          amount: prices[j].amount,
          spread,
          profitUSD,
          slippage,
        };
      }
    }
  }
  return best;
}

async function simulateAndExecute(web3, contract, opportunity) {
  try {
    const res = await contract.methods.simulateArbitrage(
      opportunity.buyFrom,
      opportunity.sellTo,
      opportunity.amount
    ).call();

    if (!res.success || res.profit < config.minProfitUSD) return false;

    const flashbots = await getFlashbotsProvider(web3);
    return await flashbots.sendPrivateTransaction(opportunity);
  } catch (err) {
    console.warn(`[SIM/EXEC FAIL]`, err.message);
    return false;
  }
}
