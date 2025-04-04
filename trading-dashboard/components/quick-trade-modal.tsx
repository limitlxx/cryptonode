"use client"

import { Separator } from "@/components/ui/separator"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Calculator, AlertCircle, ArrowRightLeft, TrendingUp, Wallet, BarChart2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import { useAppContext } from "@/context/app-context"

interface QuickTradeModalProps {
  isOpen: boolean
  onClose: () => void
  tradingPair: {
    pair: string
    exchange1: string
    price1: number
    exchange2: string
    price2: number
    spread: number
  } | null
}

export default function QuickTradeModal({ isOpen, onClose, tradingPair }: QuickTradeModalProps) {
  const [loanAmount, setLoanAmount] = useState<string>("1")
  const [estimatedProfit, setEstimatedProfit] = useState<number | null>(null)
  const [showProfitEstimate, setShowProfitEstimate] = useState<boolean>(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [gasCost, setGasCost] = useState<number | null>(null)
  const [slippageAmount, setSlippageAmount] = useState<number | null>(null)
  const [protocolFeeAmount, setProtocolFeeAmount] = useState<number | null>(null)
  const [simulationDetails, setSimulationDetails] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(isOpen)
  const [lendingProtocol, setLendingProtocol] = useState<string>("aave")
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5)
  const [gasPrice, setGasPrice] = useState<number>(30)
  const [activeTab, setActiveTab] = useState<string>("simulation")
  const [simulationProgress, setSimulationProgress] = useState<number>(0)
  const [simulationSteps, setSimulationSteps] = useState<string[]>([])
  const { toast } = useToast()
  const { addNotification } = useAppContext()

  // Reset simulation progress when modal opens
  useEffect(() => {
    if (isOpen) {
      setSimulationProgress(0)
      setSimulationSteps([])
      setShowProfitEstimate(false)
      setEstimatedProfit(null)
      setSimulationDetails(null)
    }
  }, [isOpen])

  const calculateEstimatedProfit = () => {
    if (!tradingPair) return

    const amount = Number.parseFloat(loanAmount)
    if (!isNaN(amount)) {
      // More realistic profit calculation
      const baseReturn = amount * (tradingPair.spread / 100)

      // Account for gas fees and lending protocol fees
      const gasFee = Math.min(0.01 + Math.random() * 0.02, amount * 0.1)
      const protocolFee = amount * 0.001 // 0.1% lending protocol fee

      // Calculate final estimated profit
      const estimatedReturn = baseReturn - gasFee - protocolFee

      setEstimatedProfit(estimatedReturn > 0 ? estimatedReturn : 0)
      setShowProfitEstimate(true)
    }
  }

  const simulateTrade = () => {
    if (!tradingPair) return

    // Show loading state
    setIsSimulating(true)
    setSimulationProgress(0)
    setSimulationSteps([])
    setActiveTab("simulation")

    // Simulate a step-by-step simulation process
    const simulationStepsData = [
      "Initializing simulation...",
      `Checking ${lendingProtocol.toUpperCase()} liquidity pool...`,
      `Calculating flash loan fee for ${loanAmount} ETH...`,
      `Simulating trade on ${tradingPair.exchange1}...`,
      `Calculating slippage (${slippageTolerance}%)...`,
      `Simulating trade on ${tradingPair.exchange2}...`,
      `Calculating gas costs (${gasPrice} gwei)...`,
      "Calculating net profit...",
      "Finalizing simulation results...",
    ]

    let currentStep = 0
    const stepInterval = setInterval(() => {
      if (currentStep < simulationStepsData.length) {
        setSimulationSteps((prev) => [...prev, simulationStepsData[currentStep]])
        setSimulationProgress(Math.round(((currentStep + 1) / simulationStepsData.length) * 100))
        currentStep++
      } else {
        clearInterval(stepInterval)
        finishSimulation()
      }
    }, 500)

    const finishSimulation = () => {
      // Calculate a more detailed profit estimate
      const amount = Number.parseFloat(loanAmount)
      if (!isNaN(amount)) {
        // Base profit from the spread
        const baseProfit = amount * (tradingPair.spread / 100)

        // Simulate gas costs based on current network conditions and user settings
        const gasUnits = 150000 + Math.floor(Math.random() * 100000) // 150k-250k gas units
        const gasCostInEth = (gasPrice * gasUnits) / 1e9 // Convert to ETH

        // Simulate slippage based on liquidity and user settings
        const slippage = (amount * slippageTolerance) / 100

        // Simulate lending protocol fees
        const protocolFee = amount * 0.001 // 0.1% fee

        // Calculate final profit
        const finalProfit = baseProfit - gasCostInEth - slippage - protocolFee

        // Update state with detailed information
        setEstimatedProfit(finalProfit)
        setGasCost(gasCostInEth)
        setSlippageAmount(slippage)
        setProtocolFeeAmount(protocolFee)
        setShowProfitEstimate(true)
        setSimulationDetails({
          baseProfit: baseProfit.toFixed(4),
          gasCost: gasCostInEth.toFixed(4),
          slippage: slippage.toFixed(4),
          protocolFee: protocolFee.toFixed(4),
          gasPrice: `${gasPrice} gwei`,
          gasUnits: gasUnits.toLocaleString(),
          slippagePercent: slippageTolerance + "%",
          profitable: finalProfit > 0,
        })

        // Add notification about simulation
        addNotification({
          type: finalProfit > 0 ? "success" : "warning",
          title: "Trade Simulation Completed",
          message:
            finalProfit > 0
              ? `Simulation shows a profit of ${finalProfit.toFixed(4)} ETH (${((finalProfit / amount) * 100).toFixed(2)}%)`
              : "Simulation indicates this trade may not be profitable",
          read: false,
        })

        // Show toast notification
        toast({
          title: "Simulation Complete",
          description:
            finalProfit > 0 ? `Estimated profit: ${finalProfit.toFixed(4)} ETH` : "This trade may not be profitable",
          variant: finalProfit > 0 ? "default" : "destructive",
        })
      }

      setIsSimulating(false)
    }
  }

  const handleExecuteTrade = () => {
    // Implement trade execution logic here
    setIsExecuting(true)

    // Simulate execution process
    setTimeout(() => {
      setIsExecuting(false)
      onClose()

      // Add notification
      addNotification({
        type: "success",
        title: "Trade Executed",
        message: `Successfully executed ${tradingPair?.pair} arbitrage between ${tradingPair?.exchange1} and ${tradingPair?.exchange2}`,
        read: false,
        action: {
          label: "View Details",
          onClick: () => console.log("View trade details"),
        },
      })

      toast({
        title: "Trade Executed",
        description: "Your trade has been successfully executed",
      })
    }, 2000)
  }

  if (!tradingPair) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Quick Trade: {tradingPair.pair}</DialogTitle>
          <DialogDescription>
            Execute an arbitrage trade between {tradingPair.exchange1} and {tradingPair.exchange2}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="setup" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="simulation" disabled={isSimulating}>
              Simulation
            </TabsTrigger>
            <TabsTrigger value="results" disabled={!showProfitEstimate}>
              Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="source-exchange">Source</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                  {tradingPair.exchange1}
                </div>
              </div>
              <div>
                <Label htmlFor="target-exchange">Target</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                  {tradingPair.exchange2}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price-1">Price ({tradingPair.exchange1})</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                  $
                  {typeof tradingPair.price1 === "number" && tradingPair.price1 < 0.01
                    ? tradingPair.price1.toFixed(6)
                    : tradingPair.price1}
                </div>
              </div>
              <div>
                <Label htmlFor="price-2">Price ({tradingPair.exchange2})</Label>
                <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                  $
                  {typeof tradingPair.price2 === "number" && tradingPair.price2 < 0.01
                    ? tradingPair.price2.toFixed(6)
                    : tradingPair.price2}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="loan-amount">Loan Amount</Label>
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
            </div>

            <div className="space-y-2">
              <Label>Slippage Tolerance: {slippageTolerance}%</Label>
              <Slider
                value={[slippageTolerance]}
                min={0.1}
                max={3}
                step={0.1}
                onValueChange={(value) => setSlippageTolerance(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label>Gas Price: {gasPrice} gwei</Label>
              <Slider value={[gasPrice]} min={10} max={100} step={1} onValueChange={(value) => setGasPrice(value[0])} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="simulate" defaultChecked />
              <Label htmlFor="simulate">Simulate before execution</Label>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => {
                  setActiveTab("simulation")
                  simulateTrade()
                }}
                className="gap-2"
              >
                <BarChart2 className="h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Simulation Progress</Label>
                <span className="text-sm">{simulationProgress}%</span>
              </div>
              <Progress value={simulationProgress} className="h-2" />
            </div>

            <div className="border rounded-md p-4 h-[200px] overflow-auto bg-muted/20">
              {simulationSteps.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Click "Run Simulation" to start
                </div>
              ) : (
                <div className="space-y-2">
                  {simulationSteps.map((step, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                      <span>{step}</span>
                    </div>
                  ))}
                  {isSimulating && simulationSteps.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                      <span>Processing...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {showProfitEstimate && simulationDetails && (
              <Button
                onClick={() => setActiveTab("results")}
                className="w-full"
                variant={simulationDetails.profitable ? "default" : "outline"}
              >
                View Results
              </Button>
            )}
          </TabsContent>

          <TabsContent value="results" className="space-y-4 py-4">
            {showProfitEstimate && estimatedProfit !== null && simulationDetails && (
              <>
                <Alert className={simulationDetails.profitable ? "border-green-500" : "border-yellow-500"}>
                  <AlertCircle
                    className={`h-4 w-4 ${simulationDetails.profitable ? "text-green-500" : "text-yellow-500"}`}
                  />
                  <AlertTitle>{simulationDetails.profitable ? "Profitable Trade" : "Simulation Results"}</AlertTitle>
                  <AlertDescription className="space-y-2">
                    <div>
                      {simulationDetails.profitable
                        ? `Estimated profit: ${estimatedProfit.toFixed(4)} ETH (${((estimatedProfit / Number.parseFloat(loanAmount)) * 100).toFixed(2)}% return)`
                        : "This opportunity may not be profitable due to current conditions."}
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <Label className="font-medium">Profit Breakdown</Label>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Base profit:</span>
                          <span className="text-green-600">+{simulationDetails.baseProfit} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Gas cost:</span>
                          <span className="text-red-600">-{simulationDetails.gasCost} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Slippage:</span>
                          <span className="text-red-600">-{simulationDetails.slippage} ETH</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Protocol fee:</span>
                          <span className="text-red-600">-{simulationDetails.protocolFee} ETH</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Net profit:</span>
                          <span className={estimatedProfit > 0 ? "text-green-600" : "text-red-600"}>
                            {estimatedProfit.toFixed(4)} ETH
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 border rounded-md p-3">
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                        <Label className="font-medium">Trade Details</Label>
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Trading pair:</span>
                          <span>{tradingPair.pair}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Buy from:</span>
                          <span>{tradingPair.exchange1}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sell to:</span>
                          <span>{tradingPair.exchange2}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spread:</span>
                          <span>{tradingPair.spread.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Flash loan:</span>
                          <span>{loanAmount} ETH</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-primary" />
                      <Label className="font-medium">Transaction Parameters</Label>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas price:</span>
                        <span>{simulationDetails.gasPrice}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gas units:</span>
                        <span>{simulationDetails.gasUnits}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Slippage tolerance:</span>
                        <span>{simulationDetails.slippagePercent}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Lending protocol:</span>
                        <span>{lendingProtocol.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onClose()}>
            Cancel
          </Button>
          {activeTab === "setup" && (
            <Button
              onClick={() => {
                setActiveTab("simulation")
                simulateTrade()
              }}
              disabled={isSimulating}
              className={isSimulating ? "opacity-70" : ""}
            >
              {isSimulating ? (
                <span className="flex items-center">
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
                  Simulating...
                </span>
              ) : (
                <>
                  <BarChart2 className="h-4 w-4 mr-2" />
                  Simulate
                </>
              )}
            </Button>
          )}
          {(activeTab === "simulation" || activeTab === "results") && showProfitEstimate && (
            <Button
              onClick={handleExecuteTrade}
              disabled={isExecuting || (simulationDetails && !simulationDetails.profitable)}
              className={isExecuting ? "opacity-70" : ""}
            >
              {isExecuting ? (
                <span className="flex items-center">
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
                  Executing...
                </span>
              ) : (
                "Execute Trade"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

