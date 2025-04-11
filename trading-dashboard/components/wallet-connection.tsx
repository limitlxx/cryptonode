"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, Copy, ExternalLink, LogOut, ChevronDown } from "lucide-react"
import { toast, useToast } from "@/components/ui/use-toast"
import { ethers } from "ethers"
import { useAppContext } from "@/context/app-context"

interface WalletToken {
  symbol: string
  name: string
  balance: string
  value: string
  usdValue: number
  address: string
}

export default function WalletConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletBalance, setWalletBalance] = useState("0.00")
  const [tokens, setTokens] = useState<WalletToken[]>([])
  const [totalValue, setTotalValue] = useState(0) 
  
  const { ownerwallet, contract } = useAppContext()
  const { toast } = useToast()

  const connectWallet = async () => {
    setIsConnecting(true)
    
    try {
      // In a real implementation, you would connect to MetaMask or other wallet here
      // For now, we'll use the wallet from context (assuming it's set up in AppContext)
      if (!ownerwallet) {
        throw new Error("Wallet not initialized")
      }

      const address = ownerwallet
      
      console.log("Connecting to wallet:", address);
      const shortenedAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
      
      setWalletAddress(shortenedAddress)
      setIsConnected(true)
      
      // Fetch balances
      await fetchBalances(address.toString());
      
      toast({
        title: "Wallet Connected",
        description: "Your wallet has been successfully connected",
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: error instanceof Error ? error.message : "Failed to connect wallet",
      })
    } finally {
      setIsConnecting(false)
    }
  }
 
  const fetchBalances = async (address: string) => {
    try {
      console.log("Fetching balances for:", address);
      
      // Call the contract to get balances
      const balances = await contract.fetchBalances(address);
      
      console.log("Got balances:", balances);
      
      if (Array.isArray(balances)) {
        setTokens(balances);
        
        // Calculate total value
        const total = balances.reduce((sum, token) => sum + token.usdValue, 0);
        setTotalValue(total);
        
        // Set ETH balance separately
        const ethBalance = balances.find(t => t.symbol === "ETH");
        if (ethBalance) {
          setWalletBalance(parseFloat(ethBalance.balance).toFixed(4));
        }
      }
    } catch (error) {
      console.error("Error in fetchBalances:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch balances",
      });
    }
  };

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setWalletBalance("0.00")
    setTokens([])
    setTotalValue(0)

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    if (!ownerwallet) return
    
    navigator.clipboard.writeText(ownerwallet.toString())
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

  // Auto-connect if wallet is already available
  useEffect(() => {
    if (ownerwallet && !isConnected) {
      connectWallet() 
    }
  }, [ownerwallet])

  // Refresh balances periodically
  useEffect(() => {
    if (isConnected && ownerwallet) {
      const intervalId = setInterval(() => {
        fetchBalances(ownerwallet.toString());
      }, 30000); // Refresh every 30 seconds
      
      return () => clearInterval(intervalId);
    }
  }, [isConnected, ownerwallet]);

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting} variant="outline" className="gap-2">
        {isConnecting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            Connect Wallet
          </>
        )}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Wallet className="h-4 w-4" />
          <span className="hidden sm:inline">{walletBalance} ETH</span>
          <span className="inline sm:hidden">Wallet</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[300px]">
        <DropdownMenuLabel>
          <div className="flex justify-between items-center">
            <span>Connected Wallet</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={copyAddress}>
              <Copy className="h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{walletAddress}</div>
          <div className="text-sm font-medium mt-2">
            Total Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <div className="text-sm font-medium mb-2">Token Balances</div>
          <div className="space-y-2 max-h-[200px] overflow-auto pr-1">
            {tokens.map((token, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                    {token.symbol.charAt(0)}
                  </div>
                  <div>
                    <div>
                      {token.balance} {token.symbol}
                    </div>
                    <div className="text-xs text-muted-foreground">{token.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2" onClick={() => window.open(`https://etherscan.io/address/${ownerwallet}`, "_blank")}>
          <ExternalLink className="h-4 w-4" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem className="gap-2 text-red-500 focus:text-red-500" onClick={disconnectWallet}>
          <LogOut className="h-4 w-4" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}