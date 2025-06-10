// dex-monitor.ts
import { ethers, JsonRpcProvider } from 'ethers';
import { Fetcher, Token } from '@uniswap/sdk';
import { Pair as SushiswapPair, Token as SushiswapToken } from '@sushiswap/sdk'; // Correct import for Sushiswap SDK
import { config , getStoredNetwork } from './config';

interface DexPair {
  address: string;
  token0: string;
  token1: string;
}

interface ArbitrageOpportunity {
  pair: string;
  spread: number;
  dex1: string;
  dex2: string;
  dex1Price: number;
  dex2Price: number;
}

class DexMonitor {
  private provider: ethers.InfuraProvider;
  private pairs: DexPair[];
  private checkInterval: number;
  private currentOpportunities: ArbitrageOpportunity[] = [];
  networkConfig: import("c:/Users/owner/Documents/limitlxx/blockchain/flashbot/trading-dashboard/lib/config").NetworkConfig;

  constructor(providerUrl: string, pairs: DexPair[], checkInterval = 5000, network = getStoredNetwork()) {
    this.networkConfig = config.networks[network];
    this.provider = new ethers.InfuraProvider(providerUrl);
    this.pairs = pairs;
    this.checkInterval = checkInterval;
  }

  async startMonitoring() {
    setInterval(async () => {
      await this.checkAllPairs();
    }, this.checkInterval);
  }

  private async checkAllPairs() {
    for (const pair of this.pairs) {
      await this.checkPair(pair);
    }
  }

  private async checkPair(pair: DexPair) {
    try {
      // Get prices from both DEXs
      const [uniPrice, sushiPrice] = await Promise.all([
        this.getUniswapPrice(pair),
        this.getSushiswapPrice(pair)
      ]);

      // Calculate spread
      const spread = this.calculateSpread(uniPrice, sushiPrice);

      if (spread > 0.5) { // 0.5% threshold
        const opportunity: ArbitrageOpportunity = {
          pair: `${pair.token0}/${pair.token1}`,
          spread,
          dex1: 'Uniswap',
          dex2: 'Sushiswap',
          dex1Price: uniPrice,
          dex2Price: sushiPrice
        };

        this.handleNewOpportunity(opportunity);
      }
    } catch (error) {
      console.error(`Error checking pair ${pair.token0}/${pair.token1}:`, error);
    }
  }

  private async getUniswapPrice(pair: DexPair): Promise<number> {
    const token0 = new Token(1, pair.token0, 18); // Replace 1 with the correct chain ID
    const token1 = new Token(1, pair.token1, 18); // Replace 1 with the correct chain ID
    const uniPair = await Fetcher.fetchPairData(token0, token1, this.provider);
    const reserves = uniPair.reserve0.divide(uniPair.reserve1);
    return parseFloat(reserves.toSignificant(6));
  }

  private async getSushiswapPrice(pair: DexPair): Promise<number> {
    const token0 = new SushiswapToken(1, pair.token0, 18); // Replace 1 with the correct chain ID
    const token1 = new SushiswapToken(1, pair.token1, 18); // Replace 1 with the correct chain ID
    const sushiPair = await SushiswapPair.fetchPairData(token0, token1, this.provider);
    const reserves = sushiPair.reserve0.divide(sushiPair.reserve1);
    return parseFloat(reserves.toSignificant(6));
  }

  private calculateSpread(price1: number, price2: number): number {
    return Math.abs((price1 - price2) / Math.min(price1, price2)) * 100;
  }

  private handleNewOpportunity(opportunity: ArbitrageOpportunity) {
    // Check if this opportunity already exists
    const existing = this.currentOpportunities.find(
      opp => opp.pair === opportunity.pair && 
            opp.dex1 === opportunity.dex1 && 
            opp.dex2 === opportunity.dex2
    );

    if (!existing || Math.abs(existing.spread - opportunity.spread) > 0.1) {
      // New or significantly changed opportunity
      if (existing) {
        // Update existing
        const index = this.currentOpportunities.indexOf(existing);
        this.currentOpportunities[index] = opportunity;
      } else {
        // Add new
        this.currentOpportunities.push(opportunity);
      }
      
      // Emit event or update UI
      this.emitOpportunityUpdate();
    }
  }

  private emitOpportunityUpdate() {
    // This would trigger your UI to update
    // For example, using a WebSocket or event emitter
    console.log('New opportunities:', this.currentOpportunities);
  }

  getOpportunities(): ArbitrageOpportunity[] {
    return [...this.currentOpportunities];
  }
}

// Example usage
const pairsToMonitor: DexPair[] = [
  {
    address: '0x...', // WETH/USDC pair address
    token0: 'WETH',
    token1: 'USDC'
  },
  // Add more pairs as needed
];

const monitor = new DexMonitor(
  'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  pairsToMonitor,
  3000 // Check every 3 seconds
);

monitor.startMonitoring();