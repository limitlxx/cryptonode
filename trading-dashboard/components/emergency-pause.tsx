"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shield, AlertTriangle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useAppContext } from "@/context/app-context"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function EmergencyPause() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false)
  const [isResumeDialogOpen, setIsResumeDialogOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const { isContractPaused, setIsContractPaused, addNotification, contract } = useAppContext()

  const handlePauseContract = () => {
    if (!reason.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide a reason for pausing the contract",
      })
      return
    }

    setIsLoading(true)

    // Simulate API call to pause contract
    try {
      // Call the actual contract method
      contract.togglePause()
      
      // Notification will be added by the context provider's wrapper
      toast({
        title: "Transaction Submitted",
        description: "Contract pause request has been sent to the blockchain",
      })
      
      setIsPauseDialogOpen(false)
      setReason("")
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeContract = () => {
    setIsLoading(true)

    // Simulate API call to resume contract
    try {
      // Call the actual contract method
      contract.togglePause()
      
      // Notification will be added by the context provider's wrapper
      toast({
        title: "Transaction Submitted",
        description: "Contract resume request has been sent to the blockchain",
      })
      
      setIsResumeDialogOpen(false)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsLoading(false)
    }
 
  }

  return (
    <>
      <Button
        variant={isContractPaused ? "outline" : "destructive"}
        size="sm"
        className="gap-2"
        onClick={() => setIsDialogOpen(true)}
      >
        <Shield className="h-4 w-4" />
        {isContractPaused ? "Contract Paused" : "Emergency Pause"}
      </Button>

      {/* Main Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Contract Emergency Controls</DialogTitle>
            <DialogDescription>
              {isContractPaused
                ? "The contract is currently paused. All operations are halted."
                : "Pause all contract operations in case of emergency."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium">Contract Status:</div>
                {isContractPaused ? (
                  <Badge variant="outline" className="bg-red-100 text-red-700 hover:bg-red-100">
                    Paused
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-green-100 text-green-700 hover:bg-green-100">
                    Active
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              {isContractPaused ? (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Contract is paused</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          All contract operations are currently halted. Users cannot execute trades, withdraw funds, or
                          interact with the contract in any way.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-md bg-yellow-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Warning</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>Emergency pause should only be used in critical situations such as:</p>
                        <ul className="list-disc pl-5 mt-1">
                          <li>Security vulnerabilities</li>
                          <li>Unexpected contract behavior</li>
                          <li>Market manipulation</li>
                          <li>Extreme market volatility</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            {isContractPaused ? (
              <Button
                variant="default"
                onClick={() => {
                  setIsDialogOpen(false)
                  setIsResumeDialogOpen(true)
                }}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resume Contract
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsDialogOpen(false)
                  setIsPauseDialogOpen(true)
                }}
              >
                <Shield className="h-4 w-4 mr-2" />
                Pause Contract
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pause Confirmation Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Contract Pause</DialogTitle>
            <DialogDescription>
              This will immediately halt all contract operations. Users will not be able to execute trades or withdraw
              funds.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">
                  Reason for pausing <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="reason"
                  placeholder="Security vulnerability, unexpected behavior, etc."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPauseDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handlePauseContract} disabled={isLoading}>
              {isLoading ? (
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
                  Pausing...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Confirm Pause
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Confirmation Dialog */}
      <Dialog open={isResumeDialogOpen} onOpenChange={setIsResumeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirm Contract Resume</DialogTitle>
            <DialogDescription>
              This will resume all contract operations. Users will be able to execute trades and withdraw funds again.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Ready to resume</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>Before resuming, please ensure that:</p>
                    <ul className="list-disc pl-5 mt-1">
                      <li>All security issues have been resolved</li>
                      <li>The contract has been audited if necessary</li>
                      <li>Market conditions are stable</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResumeDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleResumeContract} disabled={isLoading}>
              {isLoading ? (
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
                  Resuming...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Resume
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

