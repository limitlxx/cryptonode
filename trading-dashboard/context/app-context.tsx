"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { ethers } from "ethers" 

const ArbitrageBot = require("@/lib/arbitrageBot") // Import your ArbitrageBot class here

// Extend the Window interface to include the ethereum property
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface AppContextType {
  isSystemActive: boolean
  setIsSystemActive: (active: boolean) => void
  isContractPaused: boolean
  setIsContractPaused: (paused: boolean) => void
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  dismissNotification: (id: string) => void
  markAllNotificationsAsRead: () => void
  unreadNotificationsCount: number
  simulateNewOpportunity: () => void
  isLoading: boolean
  ownerwallet: String
  contract: {
    getTokenBalances(tokenAddresses: string[]): unknown
    executeArbitrage: (params: ArbitrageParams) => Promise<void>
    simulateArbitrage: (params: SimulateParams) => Promise<SimulationResult>
    togglePause: () => Promise<void>
    isPaused: () => Promise<boolean>
    configureDex: (name: string, router: string) => Promise<void>
    fetchBalances: (tokenAddresses: string) => Promise<void>
    getProtocolLiquidity: (protocolName: string, tokenAddress: string) => Promise<void>
    getNetworkTokens: () => Promise<string>
    activeNetwork: String
  }
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
  
  
}

interface Notification {
  id: string
  type: "alert" | "success" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

// bot
interface ArbitrageParams {
  token: string
  amount: string
  sourceDex: string
  targetDex: string
  path: string[]
  minReturn: string
}

interface SimulateParams {
  token: string
  amount: string
  sourceDex: string
  targetDex: string
  path: string[]
}

interface SimulationResult {
  profitable: boolean
  potentialProfit: string
  spreadBP: string
}

const AppContext = createContext<AppContextType | undefined>(undefined)


// Add these helper functions at the top of the file
const getLocalStorageItem = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error reading from localStorage', error);
    return defaultValue;
  }
};

const setLocalStorageItem = <T,>(key: string, value: T): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error writing to localStorage', error);
  }
};


export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);

  // Initialize state with localStorage values
  const [isSystemActive, setIsSystemActive] = useState(
    getLocalStorageItem('arbitrage:isSystemActive', true)
  );
  const [isContractPaused, setIsContractPaused] = useState(
    getLocalStorageItem('arbitrage:isContractPaused', false)
  );
  const [notifications, setNotifications] = useState<Notification[]>(
    getLocalStorageItem('arbitrage:notifications', [
      {
        id: "1",
        type: "warning",
        title: "High spread detected",
        message: "SUSHI/ETH pair shows 3.03% spread between Uniswap and Sushiswap",
        timestamp: new Date(Date.now() - 2 * 60 * 1000),
        read: false,
      },
      {
        id: "2",
        type: "success",
        title: "Transaction completed",
        message: "Flash loan of 10 ETH has been successfully repaid",
        timestamp: new Date(Date.now() - 15 * 60 * 1000),
        read: false,
      },
    ])
  );  
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  const [contract, setContract] = useState<any>(null)
  const [ownerwallet, setWallet] = useState<any>(null)
  const [arbitrageBot, setArbitrageBot] = useState<InstanceType<typeof ArbitrageBot> | null>(null);

  // Add network status listener
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);


   // Add useEffect hooks to persist state changes
  useEffect(() => {
    setLocalStorageItem('arbitrage:isSystemActive', isSystemActive);
  }, [isSystemActive]);

  useEffect(() => {
    setLocalStorageItem('arbitrage:isContractPaused', isContractPaused);
  }, [isContractPaused]);

  useEffect(() => {
    setLocalStorageItem('arbitrage:notifications', notifications);
  }, [notifications]);
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Automatically pause system when contract is paused
  useEffect(() => {
    if (isContractPaused && isSystemActive) {
      setIsSystemActive(false)
    }
  }, [isContractPaused, isSystemActive])

  useEffect(() => {
    const initContract = async () => {
      console.log("1. Initializing contract...");
      
      try {
        setIsLoading(true);
        const bot = new ArbitrageBot('sepolia');
        setArbitrageBot(bot);
        
        await bot.start();
        console.log(`3. 🔑 Wallet Address: ${bot.wallet.address}`);  
         
        setWallet(bot.wallet.address);
        setContract(bot.arbitrageContract);
  
        // Use the bot's isPaused method which now has caching
        const paused = await withRetry(() => bot.isPaused());
        console.log(`4. Contract paused state: ${paused.toString()}`);
        
        setIsContractPaused(paused);
      }  catch (error) {
        console.error("Error initializing ArbitrageBot:", error);
        addNotification({
          type: 'warning',
          title: 'Initialization Failed',
          message: error instanceof Error ? error.message : "An unknown error occurred",
          read: false
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    initContract();
  }, []);
  
  // Wrap contract functions for easier use
  // Update the contractActions object in app-context.tsx

const contractActions = {
  executeArbitrage: async (params: ArbitrageParams) => {
    try {
      setIsLoading(true);
      if (!arbitrageBot) throw new Error("ArbitrageBot not initialized");
      
      const tx = await withRetry(async () => {
        return await arbitrageBot.arbitrageContract.executeArbitrage(
          params.token,
          params.amount,
          params.sourceDex,
          params.targetDex,
          params.path,
          params.minReturn
        );
      });
      
      await tx.wait();
      addNotification({
        type: 'success',
        title: 'Arbitrage Executed',
        message: `Transaction completed: ${tx.hash}`,
        read: false
      });
      return tx;
    } catch (error) {
      addNotification({
        type: 'warning',
        title: 'Transaction Failed',
        message: error instanceof Error ? error.message : "An unknown error occurred",
        read: false
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  },
  
  simulateArbitrage: async (params: SimulateParams) => {
    return await contract.simulateArbitrage(params)
  },
  togglePause: async () => {
    try {
      setIsLoading(true);
      if (!arbitrageBot) throw new Error("ArbitrageBot not initialized");
      
      const tx = await withRetry(() => arbitrageBot.togglePause());
      await tx.wait();
      
      // Get fresh paused state
      const paused = await withRetry(() => arbitrageBot.isPaused());
      setIsContractPaused(paused);
      
      addNotification({
        type: paused ? 'warning' : 'success',
        title: paused ? 'Contract Paused' : 'Contract Resumed',
        message: `Contract has been ${paused ? 'paused' : 'resumed'}`,
        read: false
      });
      
      return tx;
    } catch (error) {
      console.error("Error toggling pause state:", error);
      addNotification({
        type: 'warning',
        title: 'Toggle Pause Failed',
        message: error instanceof Error ? error.message : "An unknown error occurred",
        read: false
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  },

  isPaused: async () => {
    if (!arbitrageBot) {
      console.error("ArbitrageBot not initialized");
      return false;
    }
    return await withRetry(() => arbitrageBot.isPaused());
  },

  fetchBalances: async (address: any) => {
    try {
      if (!arbitrageBot) {
        console.error("ArbitrageBot not initialized yet");
        return [];
      }
      
      setIsLoading(true);
      const balances = await withRetry(() => arbitrageBot.fetchBalances(address));
      return balances;
    } catch (error) {
      console.error("Error in AppContext fetchBalances:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  },
  configureDex: async (name: string, router: string) => {
    await contract.configureDex(name, router)
  }, 
  getTokenBalances: async (tokenAddresses: string[]) => {
    try {
      if (!arbitrageBot) {
        console.error("ArbitrageBot not initialized yet");
        return [];
      }
      
      setIsLoading(true);
      const balances = await withRetry(() => arbitrageBot.getTokenBalances(tokenAddresses));
      return balances;
    } catch (error) {
      console.error("Error getting token balances:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  },
  getProtocolLiquidity: async (protocolName: string, tokenAddress: string) => {
    try {
      if (!arbitrageBot) {
        console.error("ArbitrageBot not initialized yet");
        return null;
      }

      setIsLoading(true);
      const liquidity = await withRetry(() => arbitrageBot.getProtocolLiquidity(protocolName, tokenAddress));
      return liquidity;
    } catch (error) {
      console.error("Error getting protocol liquidity:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  },
  getNetworkTokens: async () => {
    try {
      if (!arbitrageBot) {
        console.error("ArbitrageBot not initialized yet");
        return [];
      }

      setIsLoading(true);
      const tokens = await withRetry(() => arbitrageBot.getNetworkTokens());
      return tokens;
    } catch (error) {
      console.error("Error getting network tokens:", error);
      return [];
    } finally {
      setIsLoading(false);
    }
  },
  activeNetwork: "sepolia" // Add the activeNetwork property
};

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])

  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Simulate a new trading opportunity
  const simulateNewOpportunity = () => {
    if (!isSystemActive || isContractPaused) return

    const pairs = ["ETH/USDT", "BTC/USDT", "LINK/ETH", "UNI/ETH", "SUSHI/ETH", "AAVE/ETH"]
    const exchanges = ["Uniswap", "Sushiswap", "Curve", "Balancer"]

    const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
    const exchange1 = exchanges[Math.floor(Math.random() * exchanges.length)]
    let exchange2
    do {
      exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)]
    } while (exchange2 === exchange1)

    // Generate a more realistic spread between 0.5% and 4.5%
    const spread = (Math.random() * 4 + 0.5).toFixed(2)

    // Create a more detailed notification
    addNotification({
      type: "alert",
      title: `New opportunity: ${randomPair}`,
      message: `${spread}% spread detected between ${exchange1} (buy) and ${exchange2} (sell)`,
      read: false,
      action: {
        label: "Trade Now",
        onClick: () => {
          console.log(`Trading ${randomPair} between ${exchange1} and ${exchange2}`)
          // You could add more functionality here to open the trade modal
        },
      },
    })

    // Play notification sound with better error handling
    try {
      const audio = new Audio("/mixkit-sci-fi-reject-notification-896.mp3")
      audio.volume = 0.5
      audio.play().catch((e) => console.log("Audio play failed:", e))
    } catch (error) {
      console.log("Audio playback not supported")
    }
  }

  const simulateNewOpportunityactive = async () => {
  if (!isSystemActive || isContractPaused) return

  // Get actual simulation data from contract
  try {
    const result = await contract.simulateArbitrage({
      token: '0x...', // Some token address
      amount: ethers.parseEther('1').toString(),
      sourceDex: 'Uniswap',
      targetDex: 'Sushiswap',
      path: ['0x...', '0x...'] // Token path
    })

    if (result.profitable) {
      addNotification({
        type: 'alert',
        title: 'New Arbitrage Opportunity',
        message: `Potential profit: ${ethers.formatEther(result.potentialProfit)} ETH`,
        action: {
          label: 'Execute',
          onClick: () => { 
            console.log(`Trading ${result.token} between ${result.sourceDex} and ${result.targetDex}`) 
           }
        },
        read: false
      })
    }
  } catch (error) {
    // Handle error
  }
  }

  return (
    <AppContext.Provider
      value={{
        isSystemActive,
        setIsSystemActive,
        isContractPaused,
        setIsContractPaused,
        notifications,
        addNotification,
        dismissNotification,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        simulateNewOpportunity,
        isLoading,
        ownerwallet,
        contract: contractActions,
        isOnline,
        setIsOnline,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}
// A utility function to retry a given asynchronous operation multiple times with a delay between attempts
async function withRetry(fn: () => Promise<any>, retries = 3, delay = 1000): Promise<any> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Attempt to execute the provided function
      return await fn();
    } catch (error) {
      // If the attempt fails and retries are still available, log a warning and wait before retrying
      if (attempt < retries) {
        console.warn(`Attempt ${attempt} failed. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // If all attempts fail, log an error and rethrow the exception
        console.error(`All ${retries} attempts failed.`);
        throw error;
      }
    }
  }
}


