"use client"

import { useEffect, useState } from "react"
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
import { getNetworkConfig, getStoredNetwork } from "@/lib/config"

const contract_env = process.env.NEXT_PUBLIC_ARBITRAGE_CONTRACT_ADDRESS ?? ""

// Enhanced token icon mapping with more tokens
const TOKEN_ICONS: Record<string, string> = {
  ETH: "🔷",
  USDC: "💵",
  DAI: "🟡",
  WBTC: "₿",
  LINK: "🔗",
  USDT: "🔷",
  AAVE: "🦇",
  EURS: "💶",
  MATIC: "🔶",
  SOL: "✨",
  AVAX: "❄️",
  BNB: "🟡",
  XRP: "✖️",
  ADA: "🅰️",
  DOT: "🔘",
  SHIB: "🐕",
  UNI: "🦄"
};

interface TokenBalance {
  symbol: string;
  name: string;
  balance: number;
  usdPrice: number;
  usdValue: number;
  address: string;
  icon: string;
  decimals: number;
}

export default function TokenBalanceOverview() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedToken, setSelectedToken] = useState<TokenBalance | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { addNotification, contract } = useAppContext();
  const { toast } = useToast();
  const [contractAddressDisplay, setContractAddressDisplay] = useState("");

  const [tokenBalances, setTokenBalances] = useState<TokenBalance[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [currentNetwork, setCurrentNetwork] = useState(getStoredNetwork());

  // Get token addresses from config for current network
  const getTokenAddresses = () => {
    const networkConfig = getNetworkConfig(currentNetwork);
    return Object.values(networkConfig.tokens);
  } 

  const fetchBalances = async () => {
    try {
      setIsLoading(true);
      const tokenAddresses = getTokenAddresses();
      const balances = await contract.getTokenBalances(tokenAddresses);
      
      if (!Array.isArray(balances)) {
        throw new Error("Invalid balances data received");
      }

      // Process balances with proper typing
      const processedBalances = balances.map((token: any) => {
        const balanceNum = parseFloat(token.balance) || 0;
        const usdValue = parseFloat(token.value?.replace('$', '') || '0');
        const usdPrice = balanceNum > 0 ? usdValue / balanceNum : 0;

        return {
          symbol: token.symbol || 'UNKNOWN',
          name: token.name || token.symbol || 'Unknown Token',
          balance: balanceNum,
          usdPrice,
          usdValue,
          address: token.address,
          icon: TOKEN_ICONS[token.symbol] || token.symbol.slice(0, 2),
          decimals: token.decimals || 18
        };
      });

      // Filter out zero balances to reduce clutter
      const nonZeroBalances = processedBalances.filter(t => t.balance > 0.0001);
      
      setTokenBalances(nonZeroBalances);
      setTotalValue(nonZeroBalances.reduce((sum, token) => sum + token.usdValue, 0));
      
      // Format contract address for display
      if (contract_env) {
        setContractAddressDisplay(
          `${contract_env.substring(0, 6)}...${contract_env.substring(contract_env.length - 4)}`
        );
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch token balances",
      });
      
      // Fallback to empty state
      setTokenBalances([]);
      setTotalValue(0);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchBalances();
  }, [contract]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchBalances();
      toast({
        title: "Balances refreshed",
        description: "Your token balances have been updated.",
      });
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleWithdrawClick = (token: TokenBalance) => {
    setSelectedToken(token);
    setWithdrawAmount("");
    setIsDialogOpen(true);
  };

  const handleWithdraw = () => {
    if (!selectedToken) return;

    const amount = Number.parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0 || amount > selectedToken.balance) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: `Please enter a valid amount between 0 and ${selectedToken.balance.toFixed(selectedToken.decimals)} ${selectedToken.symbol}`,
      });
      return;
    }

    setIsWithdrawing(true);

    // Simulate withdrawal process
    setTimeout(() => {
      setIsWithdrawing(false);
      setIsDialogOpen(false);

      addNotification({
        type: "success",
        title: "Withdrawal initiated",
        message: `${amount.toFixed(6)} ${selectedToken.symbol} is being transferred`,
        read: false,
        action: {
          label: "View Transaction",
          onClick: () => console.log(`View transaction for ${selectedToken.symbol} withdrawal`),
        },
      });

      toast({
        title: "Withdrawal successful",
        description: `${amount.toFixed(6)} ${selectedToken.symbol} has been sent`,
      });
    }, 2000);
  };

  const handleMaxClick = () => {
    if (selectedToken) {
      setWithdrawAmount(selectedToken.balance.toString());
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(contract_env);
    toast({
      title: "Address Copied",
      description: "Contract address copied to clipboard",
    });
  };

  // Format balance with appropriate decimal places
  const formatBalance = (balance: number, decimals: number) => {
    return balance.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: balance < 1 ? decimals : 2,
    });
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Contract Wallet Balance</CardTitle>
            <CardDescription>
              Tokens held in the arbitrage contract
              <br />
              <span className="text-sm font-medium text-muted-foreground">
                {contractAddressDisplay}{" "}
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={copyAddress} 
                  className="text-xs text-muted-foreground mt-1"
                >
                  Copy Address
                </Button>
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh} 
              disabled={isRefreshing || isLoading}
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
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
          <span className="text-xl font-bold">
            {isLoading ? (
              <span className="inline-block h-6 w-20 animate-pulse rounded bg-muted" />
            ) : (
              `$${totalValue.toLocaleString()}`
            )}
          </span>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-full bg-muted" />
                  <div className="space-y-1">
                    <div className="h-4 w-16 rounded bg-muted" />
                    <div className="h-3 w-24 rounded bg-muted" />
                  </div>
                </div>
                <div className="space-y-1 text-right">
                  <div className="h-4 w-20 rounded bg-muted" />
                  <div className="h-3 w-16 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        ) : tokenBalances.length > 0 ? (
          <>
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
                  <TableRow key={`${token.symbol}-${token.address}`}>
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
                        {formatBalance(token.balance, token.decimals)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        $
                        {token.usdPrice.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      ${token.usdValue.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleWithdrawClick(token)} 
                        className="h-8"
                        disabled={token.balance <= 0}
                      >
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
                Withdrawals from the contract may take 1-2 minutes to complete and require gas fees.
              </AlertDescription>
            </Alert>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No tokens found</h3>
            <p className="text-sm text-muted-foreground">
              The contract wallet currently holds no token balances
            </p>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Withdraw {selectedToken?.symbol}</DialogTitle>
              <DialogDescription>
                Transfer tokens from the contract to your wallet
              </DialogDescription>
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
                    step={10 ** -Math.min(selectedToken?.decimals || 6, 6)}
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
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Withdraw
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}