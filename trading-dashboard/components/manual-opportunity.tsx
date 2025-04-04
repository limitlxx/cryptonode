"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, ArrowRight, Calculator } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ManualOpportunity() {
  const [lendingProtocol, setLendingProtocol] = useState<string>("aave")
  const [lendingProtocolAdv, setLendingProtocolAdv] = useState<string>("aave")
  const [loanAmount, setLoanAmount] = useState<string>("10")
  const [estimatedProfit, setEstimatedProfit] = useState<number | null>(0.042)
  const [showProfitEstimate, setShowProfitEstimate] = useState<boolean>(false)
  const [simulationDetails, setSimulationDetails] = useState<any>(null)

  const calculateEstimatedProfit = () => {
    // This would normally call an API or do a calculation
    // For demo purposes, we'll create a more realistic simulation
    const amount = Number.parseFloat(loanAmount)
    if (!isNaN(amount)) {
      // Base profit calculation (0.3-0.7% return)
      const profitRate = 0.003 + Math.random() * 0.004
      const baseProfit = amount * profitRate

      // Simulate gas costs
      const gasPrice = 30 + Math.floor(Math.random() * 50) // 30-80 gwei
      const gasUnits = 200000 // Typical gas units for a complex transaction
      const gasCostInEth = (gasPrice * gasUnits) / 1e9 // Convert to ETH

      // Simulate other costs
      const slippage = amount * 0.001 // 0.1% slippage
      const protocolFee = amount * 0.001 // 0.1% lending protocol fee

      // Calculate final profit
      const finalProfit = baseProfit - gasCostInEth - slippage - protocolFee

      // Update state
      setEstimatedProfit(finalProfit)
      setShowProfitEstimate(true)
      setSimulationDetails({
        baseProfit: baseProfit.toFixed(4),
        gasCost: gasCostInEth.toFixed(4),
        slippage: slippage.toFixed(4),
        protocolFee: protocolFee.toFixed(4),
        profitable: finalProfit > 0,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manual Opportunity</CardTitle>
        <CardDescription>Enter arbitrage details and execute manually</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="simple">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="simple">Simple</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="simple" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-exchange">Source Exchange</Label>
                <Select defaultValue="uniswap">
                  <SelectTrigger id="source-exchange">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniswap">Uniswap</SelectItem>
                    <SelectItem value="sushiswap">Sushiswap</SelectItem>
                    <SelectItem value="curve">Curve</SelectItem>
                    <SelectItem value="balancer">Balancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-exchange">Target Exchange</Label>
                <Select defaultValue="sushiswap">
                  <SelectTrigger id="target-exchange">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniswap">Uniswap</SelectItem>
                    <SelectItem value="sushiswap">Sushiswap</SelectItem>
                    <SelectItem value="curve">Curve</SelectItem>
                    <SelectItem value="balancer">Balancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token-pair">Token Pair</Label>
                <Select defaultValue="eth-usdc">
                  <SelectTrigger id="token-pair">
                    <SelectValue placeholder="Select token pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth-usdc">ETH/USDC</SelectItem>
                    <SelectItem value="eth-dai">ETH/DAI</SelectItem>
                    <SelectItem value="wbtc-eth">WBTC/ETH</SelectItem>
                    <SelectItem value="link-eth">LINK/ETH</SelectItem>
                    <SelectItem value="uni-eth">UNI/ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lending-protocol">Lending Protocol</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocol === "aave" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocol("aave")}
                  >
                    Aave
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocol === "compound" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocol("compound")}
                  >
                    Compound
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocol === "dydx" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocol("dydx")}
                  >
                    dYdX
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="loan-amount">Loan Amount (ETH)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="loan-amount"
                  type="number"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  min="0.1"
                  step="0.1"
                />
                <Button variant="outline" size="icon" onClick={calculateEstimatedProfit}>
                  <Calculator className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {showProfitEstimate && estimatedProfit !== null && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Estimated Profit</AlertTitle>
                <AlertDescription className="space-y-2">
                  {estimatedProfit > 0 ? (
                    <>
                      <p>
                        Approximately {estimatedProfit.toFixed(4)} ETH (
                        {((estimatedProfit / Number.parseFloat(loanAmount)) * 100).toFixed(2)}% return)
                      </p>
                      {simulationDetails && (
                        <div className="text-xs mt-2 space-y-1">
                          <div className="grid grid-cols-2 gap-1">
                            <span>Base profit:</span>
                            <span className="text-green-600">+{simulationDetails.baseProfit} ETH</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span>Gas cost:</span>
                            <span className="text-red-600">-{simulationDetails.gasCost} ETH</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span>Slippage:</span>
                            <span className="text-red-600">-{simulationDetails.slippage} ETH</span>
                          </div>
                          <div className="grid grid-cols-2 gap-1">
                            <span>Protocol fee:</span>
                            <span className="text-red-600">-{simulationDetails.protocolFee} ETH</span>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p>This opportunity may not be profitable due to gas costs and fees.</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="simulate">Simulate before execution</Label>
                <Switch id="simulate" defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="source-exchange-adv">Source Exchange</Label>
                <Select defaultValue="uniswap">
                  <SelectTrigger id="source-exchange-adv">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniswap">Uniswap</SelectItem>
                    <SelectItem value="sushiswap">Sushiswap</SelectItem>
                    <SelectItem value="curve">Curve</SelectItem>
                    <SelectItem value="balancer">Balancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-exchange-adv">Target Exchange</Label>
                <Select defaultValue="sushiswap">
                  <SelectTrigger id="target-exchange-adv">
                    <SelectValue placeholder="Select exchange" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="uniswap">Uniswap</SelectItem>
                    <SelectItem value="sushiswap">Sushiswap</SelectItem>
                    <SelectItem value="curve">Curve</SelectItem>
                    <SelectItem value="balancer">Balancer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="token-a">Token A</Label>
                <Select defaultValue="eth">
                  <SelectTrigger id="token-a">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="wbtc">WBTC</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="dai">DAI</SelectItem>
                    <SelectItem value="link">LINK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-b">Token B</Label>
                <Select defaultValue="usdc">
                  <SelectTrigger id="token-b">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="wbtc">WBTC</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="dai">DAI</SelectItem>
                    <SelectItem value="link">LINK</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="token-c">Token C (Optional)</Label>
                <Select>
                  <SelectTrigger id="token-c">
                    <SelectValue placeholder="Select token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="eth">ETH</SelectItem>
                    <SelectItem value="wbtc">WBTC</SelectItem>
                    <SelectItem value="usdc">USDC</SelectItem>
                    <SelectItem value="dai">DAI</SelectItem>
                    <SelectItem value="link">LINK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lending-protocol-adv">Lending Protocol</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocolAdv === "aave" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocolAdv("aave")}
                  >
                    Aave
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocolAdv === "compound" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocolAdv("compound")}
                  >
                    Compound
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`rounded-full ${lendingProtocolAdv === "dydx" ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary" : ""}`}
                    onClick={() => setLendingProtocolAdv("dydx")}
                  >
                    dYdX
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="loan-amount-adv">Loan Amount</Label>
                <Input id="loan-amount-adv" type="number" defaultValue="10" min="0.1" step="0.1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-slippage">Max Slippage (%)</Label>
                <Input id="max-slippage" type="number" defaultValue="0.5" min="0.1" step="0.1" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gas-price">Gas Price (Gwei)</Label>
                <Input id="gas-price" type="number" defaultValue="30" min="1" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Trading Route</Label>
              <div className="flex items-center gap-2 p-3 border rounded-md">
                <div className="px-3 py-1 bg-muted rounded-md">ETH</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-1 bg-muted rounded-md">USDC</div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div className="px-3 py-1 bg-muted rounded-md">ETH</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="private-tx">Use private transaction</Label>
                <Switch id="private-tx" defaultChecked />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="simulate-adv">Simulate before execution</Label>
                <Switch id="simulate-adv" defaultChecked />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Simulate</Button>
        <Button>Execute Trade</Button>
      </CardFooter>
    </Card>
  )
}

