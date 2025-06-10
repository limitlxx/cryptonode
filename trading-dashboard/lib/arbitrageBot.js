const { ethers } = require('ethers');
const { FlashbotsBundleProvider } = require('@flashbots/ethers-provider-bundle'); 
const AaveArbitrageV1 = require('./abi/contractABI.json'); // Import the Aave arbitrage contract ABI
import { config , getStoredNetwork } from './config';
const ownables = require('./wallet.js'); // Import the wallet address

import dotenv from "dotenv"
dotenv.config() 

async function withExponentialBackoff(fn, maxRetries = 3, initialDelay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

class ArbitrageBot {
  constructor(network = getStoredNetwork()) {   
    this.networkConfig = config.networks[network];
    this.activeNetwork = network;
    this.cache = {
      prices: null,
      lastPriceUpdate: 0,
      contractState: null,
      lastContractStateUpdate: 0
    };
    this.requestQueue = [];
    this.processingQueue = false;
    console.log(`🔧 Initializing arbitrage bot for ${network.toUpperCase()}...`);     

    // Initialize provider using ethers v6 InfuraProvider
    this.provider = new ethers.InfuraProvider(
      this.networkConfig.rpcUrl, // Network name
      process.env.NEXT_PUBLIC_INFURA_API_KEY // Your Infura API key
    );
    
    console.log(`🌐 Connected to ${network} via Infura`);

    // Initialize wallet
    if (!process.env.NEXT_PUBLIC_PRIVATE_KEY) {
      throw new Error('Private key required in environment variables');
    }
    this.wallet = new ethers.Wallet(process.env.NEXT_PUBLIC_PRIVATE_KEY, this.provider); 

    // Initialize contract
    if (!process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS) {
      throw new Error('Contract address required in environment variables');
    }
    // console.log("📜 Contract Address:", process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS);
    // console.log("📜 Contract ABI:", JSON.stringify(AaveArbitrageV1, null, 2)); // Pretty print ABI
    // console.log("👛 Wallet Address:", this.wallet.address); // Only log wallet address

    this.arbitrageContract = new ethers.Contract(
      process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS,
      AaveArbitrageV1.abi,
      this.wallet
    );   

    // Initialize Flashbots if on Ethereum mainnet or sepolia
    if (['ethereum', 'sepolia'].includes(network)) {
      this.initFlashbots();
    }
    
    this.active = false;
    this.opportunities = [];
    this.isOnline = true;
    this.offlineQueue = [];
    this.setupNetworkListeners();
  } 

  setupNetworkListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.processOfflineQueue();
        console.log('Network: Online - Processing queued requests');
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        console.log('Network: Offline - Queuing requests');
      });

      this.isOnline = navigator.onLine;
    }
  }
 

  async networkAwareRequest(fn) {
    if (!this.isOnline) {
      // Add to offline queue and return a promise that will resolve when processed
      return new Promise((resolve, reject) => {
        this.offlineQueue.push({ fn, resolve, reject });
      });
    }

    try {
      return await fn();
    } catch (error) {
      if (error.message.includes('Failed to fetch') || error.message.includes('Network request failed')) {
        this.isOnline = false;
        // Add to offline queue to retry later
        return new Promise((resolve, reject) => {
          this.offlineQueue.push({ fn, resolve, reject });
        });
      }
      throw error;
    }
  }

  async processOfflineQueue() {
    while (this.offlineQueue.length > 0 && this.isOnline) {
      const { fn, resolve, reject } = this.offlineQueue.shift();
      try {
        const result = await fn();
        resolve(result);
        // Add slight delay between processing queued requests
        await new Promise(r => setTimeout(r, 100));
      } catch (error) {
        reject(error);
      }
    }
  }

  // Updated initFlashbots for ethers v6
  async initFlashbots() {
    this.flashbotsProvider = await FlashbotsBundleProvider.create(
      this.provider,
      this.wallet,
      this.networkConfig.flashbotsEndpoint,
      this.networkConfig.chainId
    );
    console.log('⚡ Flashbots provider initialized');
  }

  async start() {
    this.active = true;
    console.log('Arbitrage bot started');
    
    // Start listening to DEX events
    // this.setupEventListeners();
    
    // Start opportunity scanner
    // this.scanInterval = setInterval(() => this.scanOpportunities(), 15000);
  }

  stop() {
    this.active = false;
    clearInterval(this.scanInterval);
    console.log('Arbitrage bot stopped');
  }

  async fetchTokenPrices () {
    return this.networkAwareRequest(async () => {
       // Cache prices for 5 minutes (300000 ms)
     const now = Date.now();
     if (this.cache.prices && now - this.cache.lastPriceUpdate < 300000) {
       console.log("Returning cached prices");
       return this.cache.prices;
     }
 
    try {
      // Get token addresses from the current network configuration
      const TOKEN_ADDRESSES = Object.entries(this.networkConfig.tokens).map(([symbol, address]) => {
        return {
          symbol,
          address,
          coingeckoId: symbol.toLowerCase() // Simple mapping for CoinGecko IDs
        };
      });
  
      const tokenIds = TOKEN_ADDRESSES.map(t => t.coingeckoId).join(',')
      // Rate limit: 1 request per second
      await this.throttleRequest();
      console.log("Fetching prices for tokens:", tokenIds);
      
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenIds}&vs_currencies=usd`
      )
      
      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Create price mapping
      const prices = {}
      TOKEN_ADDRESSES.forEach(token => {
        prices[token.symbol] = data[token.coingeckoId]?.usd || 0
      })

      // Update cache
      this.cache.prices = prices;
      this.cache.lastPriceUpdate = now;
      
      return prices
    } catch (error) {
      console.error("Error fetching prices:", error)
      // Fallback prices
      return {
        ETH: 3500,
        USDC: 1,
        DAI: 1,
        WBTC: 65000,
        UST: 1,
        AAVE: 100,
        LINK: 15,
        EURS: 1.1
      }
    }
    });
    
  }

  // Add rate limiting queue
  async throttleRequest() {
    return new Promise(resolve => {
      this.requestQueue.push(resolve);
      if (!this.processingQueue) {
        this.processQueue();
      }
    });
  } 

  async processQueue() {
    this.processingQueue = true;
    while (this.requestQueue.length > 0) {
      const resolve = this.requestQueue.shift();
      resolve();
      // Rate limit to 1 request per second
      await new Promise(r => setTimeout(r, 1000));
    }
    this.processingQueue = false;
  }

  async setupEventListeners() {
    // Setup event listeners for each DEX
    for (const [dexName, dexConfig] of Object.entries(config.dexes)) {
      const router = new ethers.Contract(
        dexConfig.router,
        ['event Swap(address indexed sender, uint amount0In, uint amount1In, uint amount0Out, uint amount1Out, address indexed to)'],
        this.provider
      );
      
      router.on('Swap', async (sender, amount0In, amount1In, amount0Out, amount1Out, to, event) => {
        if (!this.active) return;
        
        // Process swap event to detect potential arbitrage
        await this.processSwapEvent(dexName, event);
      });
    }
  }

  async processSwapEvent(dexName, event) {
    // Extract token pair from event
    const tokenIn = amount0In > 0 ? await this.getTokenFromPair(event.address, 0) : await this.getTokenFromPair(event.address, 1);
    const tokenOut = amount0Out > 0 ? await this.getTokenFromPair(event.address, 0) : await this.getTokenFromPair(event.address, 1);
    
    // Check arbitrage opportunities against other DEXs
    for (const [otherDex, otherConfig] of Object.entries(config.dexes)) {
      if (otherDex === dexName) continue;
      
      const opportunity = await this.checkArbitrage(tokenIn, tokenOut, dexName, otherDex);
      if (opportunity) {
        this.opportunities.push(opportunity);
        console.log('New opportunity detected:', opportunity);
      }
    }
  }

  async checkArbitrage(tokenIn, tokenOut, sourceDex, targetDex) {
    const path = [tokenIn, tokenOut];
    const reversePath = [tokenOut, tokenIn];
    
    // Get price from source DEX
    const sourceAmountOut = await this.getPrice(sourceDex, path, ethers.utils.parseUnits('1', 18));
    
    // Get price from target DEX (reverse direction)
    const targetAmountOut = await this.getPrice(targetDex, reversePath, sourceAmountOut);
    
    // Calculate spread and profit
    const spread = ((targetAmountOut.sub(ethers.utils.parseUnits('1', 18)))
      .mul(10000)
      .div(ethers.utils.parseUnits('1', 18)));
    
    if (spread.gt(config.minSpreadThreshold)) {
      // Simulate full arbitrage with flash loan
      const simulatedProfit = await this.simulateArbitrage(
        tokenIn,
        ethers.utils.parseUnits('1', 18),
        sourceDex,
        targetDex,
        path
      );
      
      if (simulatedProfit.gt(config.minProfitThreshold)) {
        return {
          pair: `${tokenIn}/${tokenOut}`,
          sourceDex,
          targetDex,
          spread: spread.toString(),
          potentialProfit: simulatedProfit.toString(),
          timestamp: new Date().toISOString()
        };
      }
    }
    return null;
  }

  async simulateArbitrage(token, amount, sourceDex, targetDex, path) {
    try {
      const result = await this.arbitrageContract.simulateArbitrage(
        token,
        amount,
        sourceDex,
        targetDex,
        path
      );
      
      return result.potentialProfit;
    } catch (error) {
      console.error('Simulation failed:', error);
      return ethers.BigNumber.from(0);
    }
  }

  async executeArbitrage(opportunity) {
    if (!this.active) {
      console.log('Bot is paused, not executing arbitrage');
      return;
    }
    
    try {
      // Determine optimal amount to borrow based on gas costs and potential profit
      const amount = this.calculateOptimalAmount(opportunity.potentialProfit);
      
      let tx;
      if (this.networkConfig.chainId === 1) {
        // Use Flashbots for Ethereum mainnet
        const bundle = [
          {
            transaction: await this.arbitrageContract.populateTransaction.executeArbitrage(
              opportunity.tokenIn,
              amount,
              opportunity.sourceDex,
              opportunity.targetDex,
              [opportunity.tokenIn, opportunity.tokenOut],
              0 // minReturn - can be 0 since we have simulation
            ),
            signer: this.wallet
          }
        ];
        
        const signedBundle = await this.flashbotsProvider.signBundle(bundle);
        const blockNumber = await this.provider.getBlockNumber();
        const simulation = await this.flashbotsProvider.simulate(signedBundle, blockNumber + 1);
        
        if (simulation.firstRevert) {
          throw new Error(`Simulation reverted: ${simulation.firstRevert.error}`);
        }
        
        tx = await this.flashbotsProvider.sendRawBundle(signedBundle, blockNumber + 1);
      } else {
        // Normal transaction for other networks
        tx = await this.arbitrageContract.executeArbitrage(
          opportunity.tokenIn,
          amount,
          opportunity.sourceDex,
          opportunity.targetDex,
          [opportunity.tokenIn, opportunity.tokenOut],
          0
        );
      }
      
      console.log('Arbitrage executed:', tx.hash);
      return tx;
    } catch (error) {
      console.error('Arbitrage execution failed:', error);
      throw error;
    }
  }

  calculateOptimalAmount(potentialProfit) {
    // Simple implementation - can be enhanced with more sophisticated logic
    const profitBn = ethers.BigNumber.from(potentialProfit);
    const minProfit = config.minProfitThreshold;
    
    if (profitBn.lt(minProfit.mul(2))) {
      return ethers.utils.parseUnits('1', 18); // Default 1 token
    }
    
    // Scale amount based on profit potential
    return minProfit.mul(ethers.BigNumber.from(10).pow(18)).div(profitBn.sub(minProfit));
  }

  async getPrice(dexName, path, amountIn) {
    const router = config.dexes[dexName].router;
    const dexRouter = new ethers.Contract(
      router,
      ['function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)'],
      this.provider
    );
    
    const amounts = await dexRouter.getAmountsOut(amountIn, path);
    return amounts[amounts.length - 1];
  }

  async getTokenFromPair(pairAddress, index) {
    const pair = new ethers.Contract(
      pairAddress,
      ['function token0() external view returns (address)', 'function token1() external view returns (address)'],
      this.provider
    );
    
    return index === 0 ? await pair.token0() : await pair.token1();
  }

  async getTokenBalances(tokenAddresses) {
    // Input validation and normalization
    if (!Array.isArray(tokenAddresses)) {
      console.error("tokenAddresses must be an array");
      return [];
    }
  
    const normalizedAddresses = tokenAddresses
      .map(addr => {
        try {
          return ethers.getAddress(addr);
        } catch {
          return null;
        }
      })
      .filter(addr => addr !== null);
  
    if (normalizedAddresses.length === 0) {
      console.error("No valid token addresses provided");
      return [];
    }
  
    // Check network status
    if (!this.isOnline) {
      console.log("Network offline - queuing token balances request");
      return this.networkAwareRequest(() => this.getTokenBalances(tokenAddresses));
    }
  
    // Cache setup
    const cacheKey = `tokenBalances:${normalizedAddresses.join(',')}`;
    const now = Date.now();
    
    // Check cache (1 minute cache duration for token balances)
    if (this.cache[cacheKey] && now - this.cache[cacheKey].timestamp < 180000) {
      console.log("Returning cached token balances");
      return this.cache[cacheKey].data;
    }
  
    try {
      const prices = await this.fetchTokenPrices(); // Fetch token prices first
      // Create contract instances
      const contracts = normalizedAddresses.map(address => {
        const isETH = address === ethers.ZeroAddress;
        return {
          address,
          isETH,
          contract: isETH ? null : new ethers.Contract(
            address,
            [
              'function balanceOf(address) view returns (uint256)',
              'function symbol() view returns (string)',
              'function decimals() view returns (uint8)'
            ],
            this.provider
          )
        };
      });
  
      // IMPORTANT: Process in smaller batches to avoid rate limiting
      const BATCH_SIZE = 1; // Process 3 tokens at a time
      const balances = [];
      
      // Process tokens in batches
      for (let i = 0; i < contracts.length; i += BATCH_SIZE) {
        const batchContracts = contracts.slice(i, i + BATCH_SIZE);
        console.log(`Processing batch ${i/BATCH_SIZE + 1} of ${Math.ceil(contracts.length/BATCH_SIZE)}`);
        
        // Process batch with exponential backoff
        const batchResults = await Promise.all(
          batchContracts.map(({ address, isETH, contract }) => 
            withExponentialBackoff(async () => {
              try {
                if (isETH) {
                  const balance = await this.provider.getBalance(process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS);
                  return {
                    address,
                    balance: ethers.formatEther(balance),
                    symbol: 'ETH',
                    decimals: 18
                  };
                }
  
                // Use sequential calls instead of Promise.all to reduce rate limit pressure
                const balance = await contract.balanceOf(process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS);
                await new Promise(r => setTimeout(r, 900)); // Small delay between calls
                
                const symbol = await contract.symbol();
                await new Promise(r => setTimeout(r, 900));
                
                const decimals = await contract.decimals();

                const balanceFormatted = ethers.formatUnits(balance, decimals);
                const usdValue = parseFloat(balanceFormatted) * (prices[symbol] || 0);
  
                return {
                  address,
                  balance: balanceFormatted,
                  symbol,
                  decimals,
                  usdValue,
                  value: `$${usdValue.toFixed(2)}`,
                  error: false
                };
              } catch (error) {
                console.error(`Error fetching balance for ${address}:`, error);
                return {
                  address,
                  balance: '0',
                  symbol: 'ERR',
                  decimals: 18,
                  usdValue: 0,
                  value: '$0.00',
                  error: true
                };
              }
            }, 5) // Increase max retries to 5
        ));
        
        balances.push(...batchResults);
        
        // Add delay between batches to avoid hitting rate limits
        if (i + BATCH_SIZE < contracts.length) {
          console.log("Adding delay between batches...");
          await new Promise(r => setTimeout(r, 3000));
        }
      }
  
      // Filter out error results if needed
      const successfulBalances = balances.filter(b => !b.error);
  
      // Update cache
      this.cache[cacheKey] = {
        data: successfulBalances,
        timestamp: now
      };
  
      return successfulBalances;
    } catch (error) {
      console.error("Error in getTokenBalances:", error);
      
      // Return cached data if available
      if (this.cache[cacheKey]) {
        console.log("Returning cached data due to error");
        return this.cache[cacheKey].data;
      }
      
      // Fallback response
      return normalizedAddresses.map(address => ({
        address,
        balance: '0',
        symbol: 'ERR',
        decimals: 18,
        error: true
      }));
    }
  }

  getwalletAddress() {
    return this.wallet.address;
  } 

 
  async fetchBalances(address) {
    // 1. Input validation
    if (!ethers.isAddress(address)) {
      console.error("Invalid address provided to fetchBalances");
      return [];
    }
  
    // 2. Check network status before proceeding
    if (!this.isOnline) {
      console.log("Network offline - queuing balances request");
      return this.networkAwareRequest(() => this.fetchBalances(address));
    }
  
    // 3. Cache key generation
    const cacheKey = `balances:${address.toLowerCase()}`;
    const now = Date.now();
    
    // 4. Check cache (5 minute cache duration)
    if (this.cache[cacheKey] && now - this.cache[cacheKey].timestamp < 300000) {
      console.log("Returning cached balances");
      return this.cache[cacheKey].data;
    }
  
    try {
      // 5. Get token prices first (with its own caching)
      const prices = await this.fetchTokenPrices();
      
      // 6. Get token addresses from config
      if (!this.networkConfig?.tokens) {
        console.error("Network configuration or tokens not found");
        return [];
      }
  
      // 7. Prepare token data
      const tokenEntries = Object.entries(this.networkConfig.tokens).map(([symbol, address]) => ({
        symbol,
        name: symbol,
        address,
        isETH: address === ethers.ZeroAddress
      }));
  
      // 8. Batch balance requests with Promise.all
      const balancePromises = tokenEntries.map(async (token) => {
        try {
          // Handle ETH separately
          if (token.isETH) {
            const balance = await this.provider.getBalance(address);
            const balanceFormatted = ethers.formatEther(balance);
            const value = parseFloat(balanceFormatted) * (prices[token.symbol] || 0);
            
            return {
              symbol: token.symbol,
              name: token.name,
              balance: balanceFormatted,
              value: `$${value.toFixed(2)}`,
              usdValue: value,
              address: token.address,
              decimals: 18
            };
          }
  
          // ERC20 tokens
          const contract = new ethers.Contract(
            token.address,
            [
              'function balanceOf(address) view returns (uint256)',
              'function decimals() view returns (uint8)'
            ],
            this.provider
          );
  
          // Batch calls
          const [balance, decimals] = await Promise.all([
            contract.balanceOf(address),
            contract.decimals()
          ]);
  
          const balanceFormatted = ethers.formatUnits(balance, decimals);
          const value = parseFloat(balanceFormatted) * (prices[token.symbol] || 0);
  
          return {
            symbol: token.symbol,
            name: token.name,
            balance: balanceFormatted,
            value: `$${value.toFixed(2)}`,
            usdValue: value,
            address: token.address,
            decimals
          };
        } catch (error) {
          console.error(`Error fetching balance for ${token.symbol}:`, error);
          return this.createZeroBalanceToken(token);
        }
      });
  
      // 9. Execute all requests with rate limiting
      const balances = await this.throttleRequests(balancePromises, 100); // 100ms delay between batches
  
      // 10. Update cache
      this.cache[cacheKey] = {
        data: balances,
        timestamp: now
      };
  
      return balances;
    } catch (error) {
      console.error("Error in fetchBalances:", error);
      
      // Return cached data if available
      if (this.cache[cacheKey]) {
        console.log("Returning cached data due to error");
        return this.cache[cacheKey].data;
      }
      
      // Fallback to mock data if no cache available
      return this.getMockBalances(address);
    }
  }
  
  // Helper methods for the class:
  
  createZeroBalanceToken(token) {
    return {
      symbol: token.symbol,
      name: token.name,
      balance: "0.0",
      value: "$0.00",
      usdValue: 0,
      address: token.address,
      decimals: token.isETH ? 18 : 0
    };
  }
  
  async throttleRequests(promises, delay) {
    const results = [];
    for (let i = 0; i < promises.length; i++) {
      results.push(await promises[i]);
      if (i < promises.length - 1) {
        await new Promise(r => setTimeout(r, delay));
      }
    }
    return results;
  }
  
  getMockBalances(address) {
    console.log("Returning mock balances data");
    return [
      {
        symbol: "ETH",
        name: "Ethereum",
        balance: "1.2345",
        value: "$4320.75",
        usdValue: 4320.75,
        address: ethers.ZeroAddress,
        decimals: 18
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        balance: "1000.00",
        value: "$1000.00",
        usdValue: 1000.00,
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        decimals: 6
      }
    ];
  }


  // Add this method to the ArbitrageBot class in arbitrageBot.js

  async togglePause() {
    try {
      if (!this.arbitrageContract) {
        throw new Error("Contract not initialized");
      }
      
      console.log("ArbitrageBot: Calling togglePause on contract");
      const tx = await this.arbitrageContract.togglePause();
      await tx.wait();
      console.log("Contract pause state toggled successfully");
      return tx;
    } catch (error) {
      console.error("Error in togglePause:", error);
      throw error;
    }
  }

  // Add this method to check paused state
  async isPaused() {
    return this.networkAwareRequest(async () => {
      const now = Date.now();
    // Cache contract state for 30 seconds
    if (this.cache.contractState && now - this.cache.lastContractStateUpdate < 30000) {
      console.log("Returning cached contract state");
      return this.cache.contractState;
    }

    try {
      if (!this.arbitrageContract) {
        throw new Error("Contract not initialized");
      }
      
      console.log("ArbitrageBot: Checking if system is paused");
      const isPaused = await this.arbitrageContract.isPaused();
      
      // Update cache
      this.cache.contractState = isPaused;
      this.cache.lastContractStateUpdate = now;
      
      return isPaused;
    } catch (error) {
      console.error("Error in isPaused:", error);
      return false;
    }
    });
    
  }
  
  getOpportunities() {
    return this.opportunities;
  }

  // Add this method to get tokens for current network
  getNetworkTokens() {
    if (!this.networkConfig?.tokens) {
      console.error('No tokens configured for network:', this.activeNetwork);
      return {};
    }
    return this.networkConfig.tokens;
  }

  async getProtocolLiquidity(protocolName, tokenSymbol) {
    try {
      const protocol = protocolName.toLowerCase();
      const tokens = this.getNetworkTokens();
      
    if (!tokens[tokenSymbol]) {
      throw new Error(`Token ${tokenSymbol} not supported on ${this.activeNetwork}`);
    }

      const tokenAddress = tokens[tokenSymbol];

      switch (protocol) {
        case 'aave':
          return await this.getAaveLiquidity(tokenAddress);
        case 'compound':
          return await this.getCompoundLiquidity(tokenAddress);
        case 'dydx':
          return await this.getDydxLiquidity(tokenAddress);
        default:
          throw new Error(`Protocol not implemented: ${protocolName}`);
      }
    } catch (error) {
      console.error(`Error getting ${protocolName} liquidity for ${tokenSymbol}:`, error);
      return {
        total: ethers.BigNumber.from(0),
        available: ethers.BigNumber.from(0),
        utilization: 0,
        error: error.message
      };
    }
  }

  async getAaveLiquidity(tokenSymbol) {
    const tokens = this.getNetworkTokens();
    const tokenAddress = tokens[tokenSymbol];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found in network config`);
    }

    // Get Aave lending pool address for current network
    const aaveAddress = this.networkConfig.protocols?.aave?.address;
    if (!aaveAddress) {
      throw new Error('Aave address not configured for this network');
    }

    const aaveContract = new ethers.Contract(
      aaveAddress,
      [
        'function getReserveData(address asset) external view returns (uint256 availableLiquidity, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 lastUpdateTimestamp)'
      ],
      this.provider
    );

    try {
      const {
        availableLiquidity,
        totalStableDebt,
        totalVariableDebt
      } = await aaveContract.getReserveData(tokenAddress);

      const totalBorrowed = totalStableDebt.add(totalVariableDebt);
      const totalLiquidity = availableLiquidity.add(totalBorrowed);
      const utilization = totalLiquidity.gt(0) 
        ? totalBorrowed.mul(10000).div(totalLiquidity).toNumber() / 100
        : 0;

      return {
        total: totalLiquidity,
        available: availableLiquidity,
        utilization,
        protocol: 'Aave',
        token: tokenSymbol
      };
    } catch (error) {
      console.error(`Error fetching Aave liquidity for ${tokenSymbol}:`, error);
      throw error;
    }
  }

  async getCompoundLiquidity(tokenSymbol) {
    const tokens = this.getNetworkTokens();
    const tokenAddress = tokens[tokenSymbol];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found in network config`);
    }

    // Get Compound comptroller address for current network
    const compoundAddress = this.networkConfig.protocols?.compound?.address;
    if (!compoundAddress) {
      throw new Error('Compound address not configured for this network');
    }

    const compoundContract = new ethers.Contract(
      compoundAddress,
      [
        'function getAllMarkets() external view returns (address[])',
        'function markets(address cToken) external view returns (bool isListed, uint256 collateralFactorMantissa, bool isComped)'
      ],
      this.provider
    );

    try {
      // Find the cToken for our underlying token
      const allMarkets = await compoundContract.getAllMarkets();
      
      // We need to find which cToken corresponds to our token
      // This is network-specific, so we'll check the first 10 markets
      // (In production, you'd want a more robust solution)
      const cTokenContracts = allMarkets.slice(0, 10).map(address => 
        new ethers.Contract(
          address,
          [
            'function underlying() external view returns (address)',
            'function getCash() external view returns (uint256)',
            'function totalBorrows() external view returns (uint256)',
            'function totalSupply() external view returns (uint256)'
          ],
          this.provider
        )
      );

      let cTokenAddress;
      for (const contract of cTokenContracts) {
        try {
          const underlying = await contract.underlying();
          if (underlying.toLowerCase() === tokenAddress.toLowerCase()) {
            cTokenAddress = contract.address;
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!cTokenAddress) {
        throw new Error(`cToken for ${tokenSymbol} not found`);
      }

      const cToken = new ethers.Contract(
        cTokenAddress,
        [
          'function getCash() external view returns (uint256)',
          'function totalBorrows() external view returns (uint256)',
          'function totalSupply() external view returns (uint256)'
        ],
        this.provider
      );

      const [cash, borrows, supply] = await Promise.all([
        cToken.getCash(),
        cToken.totalBorrows(),
        cToken.totalSupply()
      ]);

      const available = cash;
      const total = cash.add(borrows);
      const utilization = total.gt(0) 
        ? borrows.mul(10000).div(total).toNumber() / 100
        : 0;

      return {
        total,
        available,
        utilization,
        protocol: 'Compound',
        token: tokenSymbol
      };
    } catch (error) {
      console.error(`Error fetching Compound liquidity for ${tokenSymbol}:`, error);
      throw error;
    }
  }

  async getDydxLiquidity(tokenSymbol) {
    const tokens = this.getNetworkTokens();
    const tokenAddress = tokens[tokenSymbol];
    
    if (!tokenAddress) {
      throw new Error(`Token ${tokenSymbol} not found in network config`);
    }

    // Get dYdX Solo Margin address for current network
    const dydxAddress = this.networkConfig.protocols?.dydx?.address;
    if (!dydxAddress) {
      throw new Error('dYdX address not configured for this network');
    }

    // First we need to find the market ID for our token
    // This requires knowing the dYdX market IDs for each network
    const marketIds = this.networkConfig.protocols?.dydx?.marketIds || {};
    const marketId = marketIds[tokenSymbol];

    if (marketId === undefined) {
      throw new Error(`Market ID for ${tokenSymbol} not configured for dYdX`);
    }

    const dydxContract = new ethers.Contract(
      dydxAddress,
      [
        'function getMarketTotalPar(uint256 marketId) external view returns (uint256, uint256)',
        'function getMarketTokenAddress(uint256 marketId) external view returns (address)'
      ],
      this.provider
    );

    try {
      // Verify the market ID maps to our token
      const marketToken = await dydxContract.getMarketTokenAddress(marketId);
      if (marketToken.toLowerCase() !== tokenAddress.toLowerCase()) {
        throw new Error(`Market ID ${marketId} does not match token ${tokenSymbol}`);
      }

      const [supplyPar, borrowPar] = await dydxContract.getMarketTotalPar(marketId);
      const available = supplyPar.sub(borrowPar);
      const total = supplyPar;
      const utilization = total.gt(0) 
        ? borrowPar.mul(10000).div(total).toNumber() / 100
        : 0;

      return {
        total,
        available,
        utilization,
        protocol: 'dYdX',
        token: tokenSymbol
      };
    } catch (error) {
      console.error(`Error fetching dYdX liquidity for ${tokenSymbol}:`, error);
      throw error;
    }
  }



}

module.exports = ArbitrageBot;