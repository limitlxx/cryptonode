"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useAppContext } from "@/context/app-context"
import { AlertCircle, BarChart2, ArrowRightLeft } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { motion } from "framer-motion"

interface OpportunityProps {
  opportunity: {
    name: string
    spread: number
    exchange1: string
    exchange2: string
  }
}

export default function OpportunityCard({ opportunity }: OpportunityProps) {
  const { addNotification } = useAppContext()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [loanAmount, setLoanAmount] = useState<string>("1")
  const [estimatedProfit, setEstimatedProfit] = useState<number | null>(null)
  const [showProfitEstimate, setShowProfitEstimate] = useState<boolean>(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [isSimulating, setIsSimulating] = useState(false)
  const [lendingProtocol, setLendingProtocol] = useState<string>("aave")

  const calculateEstimatedProfit = () => {
    setIsSimulating(true)

    const amount = Number.parseFloat(loanAmount)
    if (!isNaN(amount)) {
      // More realistic profit calculation that accounts for gas fees and slippage
      const baseProfit = amount * (opportunity.spread / 100)

      // Subtract estimated gas fees (0.01-0.03 ETH) and slippage (0.1-0.3%)
      const gasFee = Math.min(0.01 + Math.random() * 0.02, amount * 0.1) // Cap at 10% of amount
      const slippage = (amount * (0.1 + Math.random() * 0.2)) / 100

      // Final estimated profit
      const finalProfit = baseProfit - gasFee - slippage

      // Simulate a delay for more realistic experience
      setTimeout(() => {
        setEstimatedProfit(finalProfit > 0 ? finalProfit : 0)
        setShowProfitEstimate(true)
        setIsSimulating(false)

        // Add a simulated notification for the calculation
        addNotification({
          type: "info",
          title: "Profit simulation",
          message: `Estimated profit for ${opportunity.name}: ${finalProfit.toFixed(4)} ETH`,
          read: false,
        })
      }, 1500)
    }
  }

  const handleExecuteTrade = () => {
    setIsExecuting(true)

    // Simulate trade execution with a more realistic delay
    setTimeout(
      () => {
        // Simulate a success or failure based on probability
        const isSuccess = Math.random() > 0.2 // 80% success rate

        if (isSuccess) {
          // Add success notification
          addNotification({
            type: "success",
            title: "Trade executed",
            message: `Successfully executed ${opportunity.name} arbitrage between ${opportunity.exchange1} and ${opportunity.exchange2}`,
            action: {
              label: "View Details",
              onClick: () => console.log("View trade details"),
            },
            read: false
          })
        } else {
          // Add failure notification
          addNotification({
            type: "alert",
            title: "Trade failed",
            message: `Failed to execute ${opportunity.name} arbitrage: ${Math.random() > 0.5 ? "High slippage detected" : "Gas price spike"}`,
            action: {
              label: "Retry",
              onClick: () => handleExecuteTrade(),
            },
            read: false
          })
        }

        setIsExecuting(false)
        setIsDialogOpen(false)
      },
      1500 + Math.random() * 1000,
    ) // Random delay between 1.5-2.5 seconds
  }

  return (
    <>
      <motion.div
        className="flex items-center justify-between p-3 rounded-lg bg-accent/50 border border-border transition-colors h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-medium">{opportunity.name}</h3>
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">{opportunity.spread.toFixed(2)}%</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {opportunity.exchange1} → {opportunity.exchange2}
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="secondary" className="gap-2">
              <ArrowRightLeft className="h-3.5 w-3.5" />
              Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Quick Trade: {opportunity.name}</DialogTitle>
              <DialogDescription>
                Execute an arbitrage trade between {opportunity.exchange1} and {opportunity.exchange2}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="source-exchange">Source</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                    {opportunity.exchange1}
                  </div>
                </div>
                <div>
                  <Label htmlFor="target-exchange">Target</Label>
                  <div className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm mt-2">
                    {opportunity.exchange2}
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
                  </div>
                </div>
              </div>

              {showProfitEstimate && estimatedProfit !== null && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Estimated Profit</AlertTitle>
                  <AlertDescription>
                    {estimatedProfit > 0
                      ? `Approximately ${estimatedProfit.toFixed(4)} ETH (${((estimatedProfit / Number.parseFloat(loanAmount)) * 100).toFixed(2)}% return)`
                      : "This opportunity may not be profitable"}
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-2">
                <Switch id="simulate" defaultChecked />
                <Label htmlFor="simulate">Simulate before execution</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="outline" onClick={calculateEstimatedProfit} disabled={isSimulating} className="gap-2">
                {isSimulating ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary"
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
                  </>
                ) : (
                  <>
                    <BarChart2 className="h-4 w-4" />
                    Simulate
                  </>
                )}
              </Button>
              <Button onClick={handleExecuteTrade} disabled={isExecuting || !showProfitEstimate} className="gap-2">
                {isExecuting ? (
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
                    Executing...
                  </>
                ) : (
                  <>
                    <ArrowRightLeft className="h-4 w-4" />
                    Execute Trade
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </>
  )
}

