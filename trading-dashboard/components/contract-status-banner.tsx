"use client"

import { useAppContext } from "@/context/app-context"
import { Shield, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function ContractStatusBanner() {
  const { isContractPaused } = useAppContext()
  const [isDismissed, setIsDismissed] = useState(false)

  if (!isContractPaused || isDismissed) return null

  return (
    <div className="bg-red-500 text-white py-2 px-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5" />
        <span className="font-medium">Emergency Pause Active:</span>
        <span>Contract operations are currently paused for security reasons.</span>
      </div>
      <Button variant="ghost" size="sm" className="text-white hover:bg-red-600" onClick={() => setIsDismissed(true)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

