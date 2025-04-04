"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Area, AreaChart, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowUp, ArrowDown, RefreshCcw, Clock } from "lucide-react"
import { useAppContext } from "@/context/app-context"

interface ChartData {
  time: string
  value: number
  previousValue?: number
}

interface InteractiveChartProps {
  title: string
  symbol: string
  initialValue: number
  volatility?: number
  timeframe?: "1m" | "5m" | "15m" | "1h" | "4h" | "1d"
  chartType?: "line" | "area"
  color?: string
  gradientColor?: string
}

export default function InteractiveChart({
  title,
  symbol,
  initialValue,
  volatility = 0.005,
  timeframe = "5m",
  chartType = "area",
  color = "hsl(var(--primary))",
  gradientColor,
}: InteractiveChartProps) {
  const { isSystemActive } = useAppContext()
  const [currentValue, setCurrentValue] = useState(initialValue)
  const [previousValue, setPreviousValue] = useState(initialValue)
  const [percentChange, setPercentChange] = useState(0)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Generate initial chart data
  useEffect(() => {
    const generateInitialData = () => {
      const now = new Date()
      const data: ChartData[] = []

      // Generate data points based on timeframe
      const points = 24
      let timeIncrement: number

      switch (selectedTimeframe) {
        case "1m":
          timeIncrement = 60 * 1000 // 1 minute
          break
        case "5m":
          timeIncrement = 5 * 60 * 1000 // 5 minutes
          break
        case "15m":
          timeIncrement = 15 * 60 * 1000 // 15 minutes
          break
        case "1h":
          timeIncrement = 60 * 60 * 1000 // 1 hour
          break
        case "4h":
          timeIncrement = 4 * 60 * 60 * 1000 // 4 hours
          break
        case "1d":
          timeIncrement = 24 * 60 * 60 * 1000 // 1 day
          break
        default:
          timeIncrement = 5 * 60 * 1000 // Default to 5 minutes
      }

      let value = initialValue

      // Create a more realistic price trend
      const trendDirection = Math.random() > 0.5 ? 1 : -1 // Overall trend direction
      const trendStrength = Math.random() * 0.3 // How strong the trend is (0-0.3)

      for (let i = points; i >= 0; i--) {
        const time = new Date(now.getTime() - i * timeIncrement)
        const timeString = time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        // Random walk with trend and momentum
        // More realistic price movement with some momentum and trend following
        const trendComponent = trendDirection * trendStrength * volatility * value
        const randomComponent = (Math.random() - 0.5) * 2 * volatility * value
        const momentumComponent = i < points ? (value - data[data.length - 1].value) * 0.2 : 0

        const change = trendComponent + randomComponent + momentumComponent
        value = value + change

        data.push({
          time: timeString,
          value: Number.parseFloat(value.toFixed(value < 1 ? 6 : 2)),
        })
      }

      setCurrentValue(data[data.length - 1].value)
      setPreviousValue(data[data.length - 2].value)
      setChartData(data)
    }

    generateInitialData()
  }, [initialValue, selectedTimeframe, volatility])

  // Update chart data periodically
  useEffect(() => {
    if (!isSystemActive) return

    const updateInterval = selectedTimeframe === "1m" ? 5000 : 10000 // Update every 5 or 10 seconds

    const intervalId = setInterval(() => {
      setChartData((prevData) => {
        const newData = [...prevData]

        // Remove first data point and add a new one
        newData.shift()

        const lastValue = newData[newData.length - 1].value
        const randomChange = (Math.random() - 0.5) * 2 * volatility * lastValue
        const newValue = lastValue + randomChange

        const now = new Date()
        const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

        newData.push({
          time: timeString,
          value: Number.parseFloat(newValue.toFixed(newValue < 1 ? 6 : 2)),
        })

        setPreviousValue(lastValue)
        setCurrentValue(newValue)
        setLastUpdated(now)

        return newData
      })
    }, updateInterval)

    return () => clearInterval(intervalId)
  }, [isSystemActive, selectedTimeframe, volatility])

  // Calculate percent change
  useEffect(() => {
    if (previousValue === 0) return
    const change = ((currentValue - previousValue) / previousValue) * 100
    setPercentChange(change)
  }, [currentValue, previousValue])

  // Handle manual refresh
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)

    // Simulate a network delay
    setTimeout(() => {
      // Update the last data point with a new random value
      setChartData((prevData) => {
        const newData = [...prevData]
        const lastIndex = newData.length - 1
        const lastValue = newData[lastIndex].value

        // Create a more realistic price movement
        // More volatile on manual refresh but still somewhat realistic
        const marketTrend = Math.random() > 0.5 ? 1 : -1 // Random market direction
        const volatilityFactor = volatility * 3 // Increased volatility for manual refresh
        const randomChange = marketTrend * (0.3 + Math.random() * 0.7) * volatilityFactor * lastValue

        const newValue = lastValue + randomChange

        newData[lastIndex] = {
          ...newData[lastIndex],
          value: Number.parseFloat(newValue.toFixed(newValue < 1 ? 6 : 2)),
        }

        setPreviousValue(lastValue)
        setCurrentValue(newValue)
        setLastUpdated(new Date())

        return newData
      })

      setIsRefreshing(false)
    }, 800)
  }, [volatility])

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge
              className={
                percentChange >= 0
                  ? "bg-green-100 text-green-700 hover:bg-green-100"
                  : "bg-red-100 text-red-700 hover:bg-red-100"
              }
            >
              {percentChange >= 0 ? "+" : ""}
              {percentChange.toFixed(2)}%
            </Badge>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="sr-only">Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-bold">
            {symbol}
            {currentValue < 1 ? currentValue.toFixed(6) : currentValue.toFixed(2)}
          </span>
          <span className={`text-sm flex items-center ${percentChange >= 0 ? "text-green-500" : "text-red-500"}`}>
            {percentChange >= 0 ? <ArrowUp className="h-3 w-3 mr-0.5" /> : <ArrowDown className="h-3 w-3 mr-0.5" />}
            {symbol}
            {Math.abs(currentValue - previousValue).toFixed(currentValue < 1 ? 6 : 2)}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <Tabs value={selectedTimeframe} onValueChange={setSelectedTimeframe} className="h-7">
            <TabsList className="h-7 p-0.5 bg-muted/50">
              <TabsTrigger value="1m" className="text-[10px] h-6 px-1.5">
                1m
              </TabsTrigger>
              <TabsTrigger value="5m" className="text-[10px] h-6 px-1.5">
                5m
              </TabsTrigger>
              <TabsTrigger value="15m" className="text-[10px] h-6 px-1.5">
                15m
              </TabsTrigger>
              <TabsTrigger value="1h" className="text-[10px] h-6 px-1.5">
                1h
              </TabsTrigger>
              <TabsTrigger value="4h" className="text-[10px] h-6 px-1.5">
                4h
              </TabsTrigger>
              <TabsTrigger value="1d" className="text-[10px] h-6 px-1.5">
                1d
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="h-[120px] w-full">
          <ChartContainer
            config={{
              value: {
                label: title,
                color: color,
              },
            }}
          >
            {chartType === "area" ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id={`${title.replace(/\s+/g, "")}Gradient`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    fillOpacity={1}
                    fill={`url(#${title.replace(/\s+/g, "")}Gradient)`}
                    strokeWidth={2}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis domain={["auto", "auto"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="time" />
                  <YAxis domain={["auto", "auto"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  )
}

