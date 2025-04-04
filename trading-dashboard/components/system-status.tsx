"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock, RefreshCcw, Server, Database, Cpu, Shield, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/app-context"
import { motion } from "framer-motion"
import EmergencyPause from "./emergency-pause"

export default function SystemStatus() {
  const { isSystemActive, isLoading, isContractPaused } = useAppContext()
  const [cpuUsage, setCpuUsage] = useState(42)
  const [memoryUsage, setMemoryUsage] = useState(60)
  const [networkLatency, setNetworkLatency] = useState(28)
  const [lastScan, setLastScan] = useState("Just now")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [logs, setLogs] = useState([
    { type: "success", message: "System started monitoring", time: "Today, 14:32:45" },
    { type: "warning", message: "High spread detected on SUSHI/ETH", time: "Today, 14:28:12" },
    { type: "info", message: "Price feed updated", time: "Today, 14:25:00" },
    { type: "error", message: "System paused due to high gas prices", time: "Today, 13:45:22" },
    { type: "success", message: "System configuration updated", time: "Today, 13:30:15" },
    { type: "info", message: "Connected to Ethereum mainnet", time: "Today, 13:28:05" },
  ])

  const handleRefresh = () => {
    setIsRefreshing(true)

    // Simulate refresh delay
    setTimeout(() => {
      // Update metrics with more realistic values
      // CPU usage - typically between 30-70% with occasional spikes
      setCpuUsage(Math.floor(Math.random() * 40) + 30)

      // Memory usage - tends to be more stable, between 50-75%
      setMemoryUsage(Math.floor(Math.random() * 25) + 50)

      // Network latency - varies based on network conditions, 15-45ms
      setNetworkLatency(Math.floor(Math.random() * 30) + 15)

      // Last scan time
      setLastScan("Just now")

      // Add refresh log
      const now = new Date()
      const timeString = `Today, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`

      // Add a more detailed log entry
      setLogs((prev) => [
        {
          type: "info",
          message: "System status refreshed manually",
          time: timeString,
        },
        ...prev.slice(0, 9),
      ])

      setIsRefreshing(false)
    }, 1000)
  }

  // Update metrics periodically
  useEffect(() => {
    if (!isSystemActive || isContractPaused) return

    const intervalId = setInterval(() => {
      // Simulate CPU usage fluctuation - more realistic patterns
      setCpuUsage((prev) => {
        // CPU tends to fluctuate in small amounts with occasional spikes
        const trend = Math.random() > 0.9 ? Math.random() * 15 : (Math.random() - 0.5) * 8
        const newValue = prev + trend
        return Math.min(Math.max(newValue, 20), 90) // Keep between 20-90%
      })

      // Simulate memory usage fluctuation - memory tends to grow slowly and occasionally drop
      setMemoryUsage((prev) => {
        // Memory typically increases slowly and occasionally gets garbage collected
        const isGarbageCollection = Math.random() > 0.9
        const change = isGarbageCollection ? -Math.random() * 10 : Math.random() * 3
        const newValue = prev + change
        return Math.min(Math.max(newValue, 40), 85) // Keep between 40-85%
      })

      // Simulate network latency fluctuation - network can have sudden spikes
      setNetworkLatency((prev) => {
        // Network latency can spike occasionally
        const isSpike = Math.random() > 0.95
        const change = isSpike ? Math.random() * 20 : (Math.random() - 0.5) * 5
        const newValue = prev + change
        return Math.min(Math.max(newValue, 15), 50) // Keep between 15-50ms
      })

      // Update last scan time - more realistic time reporting
      const timeSinceLastScan = Math.floor(Math.random() * 3)
      if (timeSinceLastScan === 0) {
        setLastScan("Just now")
      } else {
        setLastScan(`${timeSinceLastScan} minute${timeSinceLastScan > 1 ? "s" : ""} ago`)
      }
    }, 5000)

    return () => clearInterval(intervalId)
  }, [isSystemActive, isContractPaused])

  // Add new log entries periodically with more realistic patterns
  useEffect(() => {
    if (!isSystemActive || isContractPaused) return

    const intervalId = setInterval(() => {
      // Control the frequency of log entries - more realistic timing
      const shouldAddLog = Math.random() > 0.6 // 40% chance of new log entry

      if (shouldAddLog) {
        const now = new Date()
        const timeString = `Today, ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`

        // Weighted log types - errors should be less common than info
        const logTypeWeights = [
          { type: "info", weight: 0.5 },
          { type: "success", weight: 0.25 },
          { type: "warning", weight: 0.15 },
          { type: "error", weight: 0.1 },
        ]

        // Select log type based on weights
        const randomValue = Math.random()
        let cumulativeWeight = 0
        let logType = "info"

        for (const typeInfo of logTypeWeights) {
          cumulativeWeight += typeInfo.weight
          if (randomValue <= cumulativeWeight) {
            logType = typeInfo.type
            break
          }
        }

        // More detailed and realistic log messages
        const logMessages = {
          info: [
            "Price feed updated from Chainlink oracle",
            "New block #" + (15000000 + Math.floor(Math.random() * 10000)) + " processed",
            "API connection refreshed with updated credentials",
            "Gas price updated to " + (Math.floor(Math.random() * 50) + 20) + " gwei",
            "Scanning for arbitrage opportunities across DEXs",
          ],
          success: [
            "Transaction 0x" +
              Math.random().toString(16).substring(2, 10) +
              " confirmed in " +
              (Math.floor(Math.random() * 5) + 1) +
              " blocks",
            "Flash loan of " + (Math.floor(Math.random() * 20) + 5) + " ETH repaid successfully",
            "Arbitrage opportunity executed with " + (Math.random() * 0.5 + 0.1).toFixed(2) + "% profit",
            "System health check passed all " + (Math.floor(Math.random() * 10) + 5) + " tests",
            "Wallet balance updated: +" + (Math.random() * 0.5).toFixed(4) + " ETH",
          ],
          warning: [
            "Gas prices increased to " + (Math.floor(Math.random() * 100) + 80) + " gwei",
            "Network congestion detected - " + (Math.floor(Math.random() * 20) + 80) + "% mempool utilization",
            "API rate limit at " + (Math.floor(Math.random() * 10) + 85) + "% - throttling requests",
            "Memory usage approaching threshold at " + (Math.floor(Math.random() * 10) + 75) + "%",
            "Slippage exceeds target on " +
              ["ETH/USDT", "BTC/USDT", "LINK/ETH"][Math.floor(Math.random() * 3)] +
              " pair",
          ],
          error: [
            "Transaction 0x" + Math.random().toString(16).substring(2, 10) + " failed: gas limit exceeded",
            "API connection timeout after " + (Math.floor(Math.random() * 10) + 5) + " seconds",
            "Flash loan repayment failed: insufficient funds",
            "Network connection error: RPC endpoint unresponsive",
            "Smart contract execution reverted: function call failed",
          ],
        }

        const message = logMessages[logType][Math.floor(Math.random() * logMessages[logType].length)]

        setLogs((prev) => [
          {
            type: logType,
            message,
            time: timeString,
          },
          ...prev.slice(0, 9),
        ]) // Keep only the 10 most recent logs
      }
    }, 8000) // Slightly longer interval for more realistic timing

    return () => clearInterval(intervalId)
  }, [isSystemActive, isContractPaused])

  const getLogBorderColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-500"
      case "warning":
        return "border-yellow-500"
      case "info":
        return "border-blue-500"
      case "error":
        return "border-red-500"
      default:
        return "border-gray-500"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">System Status</h1>
        <div className="flex items-center gap-2">
          <EmergencyPause />
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCcw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current operational status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isContractPaused && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Shield className="h-5 w-5 text-red-400" aria-hidden="true" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">Contract Emergency Pause Active</h3>
                      <div className="mt-2 text-sm text-red-700">
                        <p>
                          The smart contract is currently in emergency pause mode. All operations including trading,
                          withdrawals, and deposits are halted. This is a security measure to protect user funds.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-muted-foreground" />
                  <span>System Status</span>
                </div>
                <Badge variant={isSystemActive ? "default" : "outline"}>{isSystemActive ? "Active" : "Paused"}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-muted-foreground" />
                  <span>Contract Status</span>
                </div>
                <Badge
                  variant="outline"
                  className={isContractPaused ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}
                >
                  {isContractPaused ? "Emergency Paused" : "Operational"}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>API Connection</span>
                </div>
                <Badge variant="outline" className="text-green-500">
                  Connected
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-yellow-500" />
                  <span>Network Latency</span>
                </div>
                <div className="flex items-center gap-2">
                  <motion.div
                    key={networkLatency}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-sm text-muted-foreground"
                  >
                    {networkLatency} ms
                  </motion.div>
                  <div
                    className={`h-2 w-2 rounded-full ${
                      networkLatency < 25 ? "bg-green-500" : networkLatency < 40 ? "bg-yellow-500" : "bg-red-500"
                    }`}
                  ></div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <span>Last Scan</span>
                </div>
                <motion.span
                  key={lastScan}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  {lastScan}
                </motion.span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-muted-foreground" />
                  <span>CPU Usage</span>
                </div>
                <motion.span
                  key={cpuUsage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  {cpuUsage}%
                </motion.span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Memory Usage</span>
                  <span className="text-sm text-muted-foreground">{(memoryUsage * 0.02).toFixed(1)} GB / 2 GB</span>
                </div>
                <Progress value={memoryUsage} className={memoryUsage > 80 ? "bg-red-200" : ""} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <Badge variant="outline" className="text-green-500">
                    Connected
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">ethereum_arbitrage_db</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>System events and logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isContractPaused && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-l-4 border-red-500 pl-4 py-2 bg-red-50"
                >
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <p className="text-sm font-medium text-red-700">Emergency Pause Activated</p>
                  </div>
                  <p className="text-xs text-red-600">All contract operations are currently halted</p>
                </motion.div>
              )}

              {logs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={index === 0 ? { opacity: 0, y: -10 } : { opacity: 1 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`border-l-4 ${getLogBorderColor(log.type)} pl-4 py-2`}
                >
                  <p className="text-sm font-medium">{log.message}</p>
                  <p className="text-xs text-muted-foreground">{log.time}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

