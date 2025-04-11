"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/app-context"
import { Power, ArrowRightLeft, X, TrendingUp, AlertCircle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export default function TradeBotSimulator() {
  const { isSystemActive, setIsSystemActive, isContractPaused } = useAppContext()
  const [tradeNotifications, setTradeNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(true)

  // Generate random trade simulations when system is active
  useEffect(() => {
    if (!isSystemActive || isContractPaused) {
      return
    }

    const pairs = ["ETH/USDT", "BTC/USDT", "LINK/ETH", "UNI/ETH", "SUSHI/ETH", "AAVE/ETH"]
    const exchanges = ["Uniswap", "Sushiswap", "Curve", "Balancer"]

    const simulateInterval = setInterval(
      () => {
        const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
        const exchange1 = exchanges[Math.floor(Math.random() * exchanges.length)]
        let exchange2
        do {
          exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)]
        } while (exchange2 === exchange1)

        // Generate a more realistic spread between 0.5% and 4.5%
        const spread = (Math.random() * 4 + 0.5).toFixed(2)
        const profit = (Math.random() * 0.05 + 0.01).toFixed(4)
        const isSuccess = Math.random() > 0.2 // 80% success rate

        const newTrade = {
          id: Date.now(),
          pair: randomPair,
          exchange1,
          exchange2,
          spread: `${spread}%`,
          profit: `${profit} ETH`,
          timestamp: new Date(),
          status: isSuccess ? "success" : "failed",
          reason: isSuccess ? null : Math.random() > 0.5 ? "High slippage" : "Gas price spike",
        }

        setTradeNotifications((prev) => [newTrade, ...prev].slice(0, 5))
        // const audio = new Audio("/mixkit-sci-fi-confirmation-914.mp3")
        // audio.volume = 0.5
        // audio.play().catch((e) => console.log("Audio play failed:", e))
      },
      Math.random() * 10000 + 15000,
    ) // Random interval between 15-25 seconds

    return () => clearInterval(simulateInterval)
  }, [isSystemActive, isContractPaused])

  const toggleSystem = () => {
    setIsSystemActive(!isSystemActive)
  }

  const removeNotification = (id: number) => {
    setTradeNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  return (
    <div className="fixed bottom-16 right-4 z-40 flex flex-col items-end space-y-2">
      <div className="flex items-center gap-2">
        <Button
          variant={isSystemActive ? "default" : "outline"}
          size="sm"
          className="gap-2 shadow-md"
          onClick={toggleSystem}
          disabled={isContractPaused}
        >
          <Power className={cn("h-4 w-4", isSystemActive ? "text-green-100" : "text-muted-foreground")} />
          System {isSystemActive ? "Active" : "Inactive"}
        </Button>

        {tradeNotifications.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 shadow-md"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            {showNotifications ? <X className="h-4 w-4" /> : <ArrowRightLeft className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showNotifications &&
          tradeNotifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={cn(
                "w-80 rounded-lg border p-3 shadow-lg backdrop-blur-sm",
                notification.status === "success" ? "bg-green-50/90 border-green-200" : "bg-red-50/90 border-red-200",
              )}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  {notification.status === "success" ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {notification.status === "success" ? "Trade Executed" : "Trade Failed"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.pair} • {notification.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 rounded-full"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="mt-2 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Route:</span>
                  <span>
                    {notification.exchange1} → {notification.exchange2}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Spread:</span>
                  <span>{notification.spread}</span>
                </div>
                {notification.status === "success" ? (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Profit:</span>
                    <span className="text-green-600 font-medium">{notification.profit}</span>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reason:</span>
                    <span className="text-red-600">{notification.reason}</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  )
}

