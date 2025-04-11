// config.ts
import { ethers } from 'ethers';

export interface NetworkConfig {
  map(arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown;
  rpcUrl: string;
  aaveProvider: string;
  chainId: number;
  flashbotsEndpoint?: string;
  explorerUrl: string;
  tokens: {
    [symbol: string]: string;
  };
}

export interface AppConfig {
  networks: {
    [network: string]: NetworkConfig;
  };
  dexes: {
    [dex: string]: {
      router: string;
      fee: number;
    };
  };
  minProfitThreshold: bigint;
  minSpreadThreshold: number;
}

export const DEFAULT_NETWORK = 'ethereum';

// Main configuration
export const config: AppConfig = {
  networks: {
    sepolia: {
        rpcUrl: "sepolia",
        aaveProvider: '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A',
        chainId: 11155111,
        flashbotsEndpoint: 'https://relay.flashbots.net',
        explorerUrl: 'https://sepolia.etherscan.io',
        tokens: {
            ETH: ethers.ZeroAddress,
            USDC: '0xda9d4f9b69ac6C22e444eD9aF0CfC043b7a7f53f',
            DAI: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357',
            WBTC: '0x29f2D40B0605204364af54EC677bD022dA425d03',
            USDT: '0x7169D38820dfd117C3FA1f22a697dBA58d90BA06',
            AAVE: '0x88541670E55cC00bEEFD87eB59EDd1b7C511AC9a',
            LINK: '0x779877A7B0D9E8603169DdbD7836e478b4624789',
            EURS: '0xB20691021F9AcED8631eDaa3c0Cd2949EB45662D'
        },
        map: function (arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown {
            throw new Error('Function not implemented.');
        }
    },
    ethereum: {
        rpcUrl: "mainnet",
        aaveProvider: '0x497a1994c46d4f6C864904A9f1fac6328Cb7C8a6',
        chainId: 1,
        flashbotsEndpoint: 'https://relay.flashbots.net',
        explorerUrl: 'https://etherscan.io',
        tokens: {
            ETH: ethers.ZeroAddress,
            USDC: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
            DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
            USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
            AAVE: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
            LINK: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
            EURS: '0xdB25f211AB05b1c97D595516F45794528a807ad8'
        },
        map: function (arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown {
            throw new Error('Function not implemented.');
        }
    },
    polygon: {
        rpcUrl: "matic",
        aaveProvider: '0x14496b405D62c24F91f04Cda1c69Dc526D56fDE5',
        chainId: 137,
        explorerUrl: 'https://polygonscan.com',
        tokens: {
            MATIC: ethers.ZeroAddress,
            USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
            DAI: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063',
            WBTC: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6',
            USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
            AAVE: '0xD6DF932A45C0f255f85145f286eA0b292B21C90B',
            LINK: '0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39'
        },
        map: function (arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown {
            throw new Error('Function not implemented.');
        }
    },
    arbitrum: {
        rpcUrl: "arbitrum",
        aaveProvider: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        chainId: 42161,
        explorerUrl: 'https://arbiscan.io',
        tokens: {
            ETH: ethers.ZeroAddress,
            USDC: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
            DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            WBTC: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
            USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
            AAVE: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196',
            LINK: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4'
        },
        map: function (arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown {
            throw new Error('Function not implemented.');
        }
    },
    optimism: {
        rpcUrl: "optimism",
        aaveProvider: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
        chainId: 10,
        explorerUrl: 'https://optimistic.etherscan.io',
        tokens: {
            ETH: ethers.ZeroAddress,
            USDC: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607',
            DAI: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1',
            WBTC: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
            USDT: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58',
            AAVE: '0x76FB31fb4af56892A25e32cFC43De717950c9278',
            LINK: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6'
        },
        map: function (arg0: (token: { address: string | ethers.Addressable; symbol: any; name: any; }) => Promise<{ symbol: any; name: any; balance: string; value: string; usdValue: number; address: string | ethers.Addressable; }>): unknown {
            throw new Error('Function not implemented.');
        }
    }
  },
  dexes: {
    uniswap: {
      router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      fee: 30 // 0.3%
    },
    sushiswap: {
      router: '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506',
      fee: 30 // 0.3%
    }
  },
  minProfitThreshold: ethers.parseUnits('50', 6), // $50 in USDC decimals
  minSpreadThreshold: 50 // 0.5% in basis points
};

// Network management utilities
export const getNetworkConfig = (network: string): NetworkConfig => {
  return config.networks[network] || config.networks[DEFAULT_NETWORK];
};

export const getAvailableNetworks = (): string[] => {
  return Object.keys(config.networks);
};

// localStorage integration
const NETWORK_STORAGE_KEY = 'arbitrageBot_network';

export const getStoredNetwork = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(NETWORK_STORAGE_KEY) || DEFAULT_NETWORK;
  }
  return DEFAULT_NETWORK;
};

export const setStoredNetwork = (network: string): void => {
  if (typeof window !== 'undefined' && config.networks[network]) {
    localStorage.setItem(NETWORK_STORAGE_KEY, network);
  }
};

// Token utilities
export const getTokenAddress = (network: string, symbol: string): string => {
  const networkConfig = getNetworkConfig(network);
  return networkConfig.tokens[symbol] || ethers.ZeroAddress;
};

export const getTokenList = (network: string): Array<{
  symbol: string;
  address: string;
}> => {
  const networkConfig = getNetworkConfig(network);
  return Object.entries(networkConfig.tokens).map(([symbol, address]) => ({
    symbol,
    address
  }));
};