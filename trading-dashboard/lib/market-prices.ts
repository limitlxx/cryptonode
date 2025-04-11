// lib/market-prices.ts
import { getNetworkConfig } from "./config";

interface TokenPrice {
  symbol: string;
  price: number;
  change24h: number;
  volume24h: number;
  lastUpdated: Date;
}

// Cache for prices
const priceCache: Record<string, TokenPrice> = {};

export async function fetchMarketPrices(): Promise<TokenPrice[]> {
  const network = getNetworkConfig('ethereum'); // Default to ethereum for prices
  const tokenSymbols = Object.keys(network.tokens);

  try {
    // Try CoinGecko API first
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbols.map(s => s.toLowerCase()).join(',')}&vs_currencies=usd&include_24hr_change=true`
    );

    if (response.ok) {
      const data = await response.json();
      const now = new Date();

      return tokenSymbols.map(symbol => {
        const symbolData = data[symbol.toLowerCase()] || {};
        const price = symbolData.usd || 0;
        const change24h = symbolData.usd_24h_change || 0;

        // Update cache
        priceCache[symbol] = {
          symbol,
          price,
          change24h,
          volume24h: price * 1000000 * (1 + Math.random() * 0.5), // Simulated volume
          lastUpdated: now
        };

        return priceCache[symbol];
      });
    }
  } catch (error) {
    console.error("Failed to fetch prices from CoinGecko:", error);
  }

  // Fallback to cached prices or simulated data
  return tokenSymbols.map(symbol => {
    if (priceCache[symbol]) {
      return priceCache[symbol];
    }

    // Fallback simulated data
    return {
      symbol,
      price: getFallbackPrice(symbol),
      change24h: (Math.random() - 0.5) * 10, // Random change between -5% and +5%
      volume24h: 1000000 * (1 + Math.random()), // Random volume
      lastUpdated: new Date()
    };
  });
}

function getFallbackPrice(symbol: string): number {
  // Hardcoded fallback prices
  const fallbackPrices: Record<string, number> = {
    ETH: 3500,
    USDC: 1,
    DAI: 1,
    WBTC: 65000,
    USDT: 1,
    AAVE: 100,
    LINK: 15,
    EURS: 1.1,
    MATIC: 0.7
  };

  return fallbackPrices[symbol] || 1;
}