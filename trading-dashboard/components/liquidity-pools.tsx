"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"

// Sample data for lending pools
const lendingPoolsData = [
  { id: 1, protocol: "Aave", token: "ETH", available: 12500, total: 15000, apy: 0.5, utilization: 83.3 },
  { id: 2, protocol: "Aave", token: "USDC", available: 8500000, total: 10000000, apy: 3.2, utilization: 85.0 },
  { id: 3, protocol: "Aave", token: "DAI", available: 5200000, total: 6000000, apy: 3.1, utilization: 86.7 },
  { id: 4, protocol: "Compound", token: "ETH", available: 8200, total: 10000, apy: 0.4, utilization: 82.0 },
  { id: 5, protocol: "Compound", token: "USDC", available: 4300000, total: 5000000, apy: 2.9, utilization: 86.0 },
  { id: 6, protocol: "dYdX", token: "ETH", available: 3600, total: 4000, apy: 0.3, utilization: 90.0 },
  { id: 7, protocol: "dYdX", token: "USDC", available: 2800000, total: 3000000, apy: 2.7, utilization: 93.3 },
  { id: 8, protocol: "Uniswap", token: "ETH/USDC", available: 18500, total: 20000, apy: null, utilization: 92.5 },
]

interface LiquidityPoolsProps {
  isLoading?: boolean
}

export default function LiquidityPools({ isLoading = false }: LiquidityPoolsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Liquidity Pools</h1>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Liquidity Pools</CardTitle>
          <CardDescription>Available liquidity across lending protocols</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Protocols</TabsTrigger>
              <TabsTrigger value="aave">Aave</TabsTrigger>
              <TabsTrigger value="compound">Compound</TabsTrigger>
              <TabsTrigger value="dydx">dYdX</TabsTrigger>
              <TabsTrigger value="uniswap">Uniswap</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 py-3">
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-4 w-[60px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[40px]" />
                      <Skeleton className="h-4 w-[80px]" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Available Liquidity</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lendingPoolsData.map((pool) => (
                      <TableRow key={pool.id}>
                        <TableCell>
                          <Badge variant="outline">{pool.protocol}</Badge>
                        </TableCell>
                        <TableCell>{pool.token}</TableCell>
                        <TableCell>
                          {pool.token === "ETH"
                            ? `${pool.available.toLocaleString()} ETH`
                            : `$${pool.available.toLocaleString()}`}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={pool.utilization} className="w-24" />
                            <span className="text-xs">{pool.utilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{pool.apy !== null ? `${pool.apy}%` : "-"}</TableCell>
                        <TableCell>
                          {pool.utilization > 90 ? (
                            <Badge variant="outline" className="text-yellow-500">
                              High Utilization
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-500">
                              Available
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {["aave", "compound", "dydx", "uniswap"].map((protocol) => (
              <TabsContent key={protocol} value={protocol} className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Token</TableHead>
                      <TableHead>Available Liquidity</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>APY</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lendingPoolsData
                      .filter((pool) => pool.protocol.toLowerCase() === protocol)
                      .map((pool) => (
                        <TableRow key={pool.id}>
                          <TableCell>
                            <Badge variant="outline">{pool.protocol}</Badge>
                          </TableCell>
                          <TableCell>{pool.token}</TableCell>
                          <TableCell>
                            {pool.token === "ETH"
                              ? `${pool.available.toLocaleString()} ETH`
                              : `$${pool.available.toLocaleString()}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={pool.utilization} className="w-24" />
                              <span className="text-xs">{pool.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{pool.apy !== null ? `${pool.apy}%` : "-"}</TableCell>
                          <TableCell>
                            {pool.utilization > 90 ? (
                              <Badge variant="outline" className="text-yellow-500">
                                High Utilization
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-500">
                                Available
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

