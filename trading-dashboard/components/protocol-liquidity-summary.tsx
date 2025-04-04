"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { ArrowUpRight, TrendingUp, Droplet, AlertCircle } from "lucide-react"

// Sample data
const protocolData = [
  { name: "Aave", liquidity: 25700000, utilization: 85, color: "#B6509E" },
  { name: "Compound", liquidity: 13200000, utilization: 82, color: "#00D395" },
  { name: "dYdX", liquidity: 5800000, utilization: 91, color: "#6966FF" },
  { name: "Uniswap", liquidity: 18500000, utilization: 88, color: "#FF007A" },
]

const tokenData = [
  { name: "ETH", liquidity: 24300000, utilization: 83, color: "#627EEA" },
  { name: "USDC", liquidity: 15600000, utilization: 85, color: "#2775CA" },
  { name: "DAI", liquidity: 5200000, utilization: 87, color: "#F5AC37" },
  { name: "WBTC", liquidity: 18100000, utilization: 79, color: "#F7931A" },
]

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md text-sm">
        <p className="font-medium">{payload[0].name}</p>
        <p className="text-muted-foreground">${payload[0].value.toLocaleString()}</p>
      </div>
    )
  }
  return null
}

export default function ProtocolLiquiditySummary() {
  const totalLiquidity = protocolData.reduce((sum, item) => sum + item.liquidity, 0)
  const averageUtilization = Math.round(
    protocolData.reduce((sum, item) => sum + item.utilization, 0) / protocolData.length,
  )

  // Find protocol with highest utilization
  const highestUtilization = protocolData.reduce((prev, current) =>
    prev.utilization > current.utilization ? prev : current,
  )

  return (
    <Card className="bg-card/50 backdrop-blur-sm h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Protocol Liquidity</CardTitle>
            <CardDescription>Available liquidity across protocols</CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="gap-1 text-xs">
            View All <ArrowUpRight className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="protocols">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="protocols">By Protocol</TabsTrigger>
            <TabsTrigger value="tokens">By Token</TabsTrigger>
          </TabsList>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Total Liquidity</span>
                  </div>
                  <span className="text-lg font-bold">${(totalLiquidity / 1000000).toFixed(1)}M</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Avg. Utilization</span>
                  </div>
                  <span className="text-lg font-bold">{averageUtilization}%</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">High Utilization</span>
                  </div>
                  <Badge variant="outline" className="text-yellow-500">
                    {highestUtilization.name} ({highestUtilization.utilization}%)
                  </Badge>
                </div>
              </div>

              <TabsContent value="protocols" className="mt-0 space-y-4">
                {protocolData.map((protocol) => (
                  <div key={protocol.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: protocol.color }} />
                        <span className="text-sm">{protocol.name}</span>
                      </div>
                      <span className="text-sm font-medium">${(protocol.liquidity / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={protocol.utilization}
                        className="h-2"
                        style={
                          {
                            "--progress-background": protocol.color + "40",
                            "--progress-foreground": protocol.color,
                          } as React.CSSProperties
                        }
                      />
                      <span className="text-xs text-muted-foreground w-7 text-right">{protocol.utilization}%</span>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="tokens" className="mt-0 space-y-4">
                {tokenData.map((token) => (
                  <div key={token.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: token.color }} />
                        <span className="text-sm">{token.name}</span>
                      </div>
                      <span className="text-sm font-medium">${(token.liquidity / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={token.utilization}
                        className="h-2"
                        style={
                          {
                            "--progress-background": token.color + "40",
                            "--progress-foreground": token.color,
                          } as React.CSSProperties
                        }
                      />
                      <span className="text-xs text-muted-foreground w-7 text-right">{token.utilization}%</span>
                    </div>
                  </div>
                ))}
              </TabsContent>
            </div>

            <div className="flex items-center justify-center h-[180px] w-full">
              <TabsContent value="protocols" className="h-full w-full mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={protocolData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="liquidity"
                      nameKey="name"
                    >
                      {protocolData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>

              <TabsContent value="tokens" className="h-full w-full mt-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tokenData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="liquidity"
                      nameKey="name"
                    >
                      {tokenData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

