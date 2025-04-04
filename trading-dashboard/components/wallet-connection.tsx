"use client"

import { useState } from "react"
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
import { useToast } from "@/components/ui/use-toast"

interface WalletToken {
  symbol: string
  name: string
  balance: string
  value: string
}

export default function WalletConnection() {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [walletAddress, setWalletAddress] = useState("")
  const [walletBalance, setWalletBalance] = useState("0.00")
  const [tokens, setTokens] = useState<WalletToken[]>([])
  const { toast } = useToast()

  const connectWallet = async () => {
    setIsConnecting(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock wallet connection
    setIsConnected(true)
    setWalletAddress("0x1234...5678")
    setWalletBalance("2.45")
    setTokens([
      { symbol: "ETH", name: "Ethereum", balance: "2.45", value: "$4,532.50" },
      { symbol: "USDT", name: "Tether", balance: "1,250.00", value: "$1,250.00" },
      { symbol: "LINK", name: "Chainlink", balance: "75.5", value: "$825.45" },
      { symbol: "UNI", name: "Uniswap", balance: "120.0", value: "$720.00" },
    ])

    setIsConnecting(false)

    toast({
      title: "Wallet Connected",
      description: "Your wallet has been successfully connected",
    })
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setWalletAddress("")
    setWalletBalance("0.00")
    setTokens([])

    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress.replace("...", ""))
    toast({
      title: "Address Copied",
      description: "Wallet address copied to clipboard",
    })
  }

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
        <DropdownMenuItem className="gap-2" onClick={() => window.open("https://etherscan.io", "_blank")}>
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

