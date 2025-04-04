"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Wallet, RefreshCcw, ArrowDownToLine, AlertCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppContext } from "@/context/app-context"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Sample token data
const tokenBalances = [
  {
    symbol: "ETH",
    name: "Ethereum",
    balance: 12.45,
    usdPrice: 3520,
    usdValue: 43824,
    address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    icon: "🔷",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    balance: 25000,
    usdPrice: 1,
    usdValue: 25000,
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    icon: "💵",
  },
  {
    symbol: "DAI",
    name: "Dai Stablecoin",
    balance: 15000,
    usdPrice: 1,
    usdValue: 15000,
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    icon: "🟡",
  },
  {
    symbol: "WBTC",
    name: "Wrapped Bitcoin",
    balance: 0.75,
    usdPrice: 65700,
    usdValue: 49275,
    address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
    icon: "₿",
  },
  {
    symbol: "LINK",
    name: "Chainlink",
    balance: 500,
    usdPrice: 13.5,
    usdValue: 6750,
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA",
    icon: "🔗",
  },
]

export default function TokenBalanceOverview() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedToken, setSelectedToken] = useState<(typeof tokenBalances)[0] | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { addNotification } = useAppContext()
  const { toast } = useToast()

  const totalValue = tokenBalances.reduce((sum, token) => sum + token.usdValue, 0)

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate API call to refresh balances
    setTimeout(() => {
      setIsRefreshing(false)
      toast({
        title: "Balances refreshed",
        description: "Your token balances have been updated.",
      })
    }, 1500)
  }

  const handleWithdrawClick = (token: (typeof tokenBalances)[0]) => {
    setSelectedToken(token)
    setWithdrawAmount("")
    setIsDialogOpen(true)
  }

  const handleWithdraw = () => {
    if (!selectedToken) return

    const amount = Number.parseFloat(withdrawAmount)
    if (isNaN(amount) || amount <= 0 || amount > selectedToken.balance) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: `Please enter a valid amount between 0 and ${selectedToken.balance} ${selectedToken.symbol}`,
      })
      return
    }

    setIsWithdrawing(true)

    // Simulate withdrawal process
    setTimeout(() => {
      setIsWithdrawing(false)
      setIsDialogOpen(false)

      // Add notification
      addNotification({
        type: "success",
        title: "Withdrawal initiated",
        message: `${amount} ${selectedToken.symbol} is being transferred to your wallet`,
        read: false,
        action: {
          label: "View Transaction",
          onClick: () => console.log(`View transaction for ${selectedToken.symbol} withdrawal`),
        },
      })

      toast({
        title: "Withdrawal successful",
        description: `${amount} ${selectedToken.symbol} has been sent to your wallet`,
      })
    }, 2000)
  }

  const handleMaxClick = () => {
    if (selectedToken) {
      setWithdrawAmount(selectedToken.balance.toString())
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Wallet Balance</CardTitle>
            <CardDescription>Your tokens in the trading contract</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
            <Button variant="ghost" size="sm" className="gap-1 text-xs">
              View All <ArrowUpRight className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium">Total Value:</span>
          </div>
          <span className="text-xl font-bold">${totalValue.toLocaleString()}</span>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Token</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Value (USD)</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokenBalances.map((token) => (
              <TableRow key={token.symbol}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">
                      {token.icon}
                    </div>
                    <div>
                      <div className="font-medium">{token.symbol}</div>
                      <div className="text-xs text-muted-foreground">{token.name}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {token.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: token.balance < 1 ? 8 : 2,
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    $
                    {token.usdPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                </TableCell>
                <TableCell className="text-right">${token.usdValue.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" onClick={() => handleWithdrawClick(token)} className="h-8">
                    <ArrowDownToLine className="h-3.5 w-3.5 mr-1.5" />
                    Withdraw
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Alert className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            Withdrawals from the contract to your wallet may take 1-2 minutes to complete.
          </AlertDescription>
        </Alert>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Withdraw {selectedToken?.symbol}</DialogTitle>
              <DialogDescription>Transfer tokens from the trading contract to your connected wallet.</DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="token" className="text-right">
                  Token
                </Label>
                <div className="col-span-3 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-lg">
                    {selectedToken?.icon}
                  </div>
                  <div>
                    <div className="font-medium">{selectedToken?.symbol}</div>
                    <div className="text-xs text-muted-foreground">
                      Balance: {selectedToken?.balance.toLocaleString()} {selectedToken?.symbol}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="amount"
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    placeholder={`0.00 ${selectedToken?.symbol}`}
                    step="any"
                    min="0"
                    max={selectedToken?.balance}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 text-xs"
                    onClick={handleMaxClick}
                  >
                    MAX
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Value</Label>
                <div className="col-span-3">
                  {!isNaN(Number.parseFloat(withdrawAmount)) && selectedToken ? (
                    <div className="text-sm">
                      $
                      {(Number.parseFloat(withdrawAmount) * selectedToken.usdPrice).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">$0.00</div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleWithdraw} disabled={isWithdrawing}>
                {isWithdrawing ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Withdrawing...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Withdraw to Wallet
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}

