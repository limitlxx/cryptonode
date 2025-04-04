"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Zap, ArrowUpRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAppContext } from "@/context/app-context"
import InteractiveChart from "./interactive-chart"
import OpportunityCard from "./opportunity-card"
import ProtocolLiquiditySummary from "./protocol-liquidity-summary"
import TokenBalanceOverview from "./token-balance-overview"

// Sample opportunity data
const opportunityData = [
  { name: "SUSHI/ETH", spread: 3.03, exchange1: "Uniswap", exchange2: "Sushiswap" },
  { name: "SNX/ETH", spread: 2.7, exchange1: "Uniswap", exchange2: "Sushiswap" },
  { name: "COMP/ETH", spread: 0.82, exchange1: "Uniswap", exchange2: "Sushiswap" },
]

export default function MarketOverview() {
  const { isLoading } = useAppContext()
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <div className="space-y-6">
      {!isMobile && (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Market Overview</h1>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3.5 w-3.5" />
              Live Data
            </Badge>
            <Button variant="outline" size="sm">
              <Zap className="h-4 w-4 mr-2" />
              Refresh All
            </Button>
          </div>
        </div>
      )}

      {/* Token Balance Overview - Add this section */}
      <TokenBalanceOverview />

      {/* Price Cards - Fixed grid layout with consistent heights */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-3">
        <div className="h-full">
          <InteractiveChart title="ETH Price" symbol="$" initialValue={3520} volatility={0.003} />
        </div>

        {!isMobile && (
          <>
            <div className="h-full">
              <InteractiveChart title="BTC Price" symbol="$" initialValue={65700} volatility={0.002} color="#F7931A" />
            </div>

            <div className="h-full">
              <InteractiveChart
                title="Trading Volume"
                symbol="$"
                initialValue={1.2}
                volatility={0.01}
                chartType="line"
              />
            </div>
          </>
        )}
      </div>

      {/* Main Content - Fixed grid layout with consistent heights */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
        <div className="h-full">
          <Card className="bg-card/50 backdrop-blur-sm h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Market Prices</CardTitle>
                  <CardDescription>24-hour price movement of major assets</CardDescription>
                </div>
                {!isMobile && (
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="eth" className="h-full">
                <TabsList className="w-full">
                  <TabsTrigger value="eth">ETH</TabsTrigger>
                  <TabsTrigger value="btc">BTC</TabsTrigger>
                  <TabsTrigger value="uni">UNI</TabsTrigger>
                  <TabsTrigger value="aave">AAVE</TabsTrigger>
                </TabsList>

                <div className="mt-4 h-[300px]">
                  <TabsContent value="eth" className="h-full m-0">
                    <InteractiveChart
                      title="ETH Price"
                      symbol="$"
                      initialValue={3520}
                      volatility={0.003}
                      timeframe="1h"
                      chartType="line"
                    />
                  </TabsContent>

                  <TabsContent value="btc" className="h-full m-0">
                    <InteractiveChart
                      title="BTC Price"
                      symbol="$"
                      initialValue={65700}
                      volatility={0.002}
                      timeframe="1h"
                      chartType="line"
                      color="#F7931A"
                    />
                  </TabsContent>

                  <TabsContent value="uni" className="h-full m-0">
                    <InteractiveChart
                      title="UNI Price"
                      symbol="$"
                      initialValue={5.6}
                      volatility={0.005}
                      timeframe="1h"
                      chartType="line"
                      color="#FF007A"
                    />
                  </TabsContent>

                  <TabsContent value="aave" className="h-full m-0">
                    <InteractiveChart
                      title="AAVE Price"
                      symbol="$"
                      initialValue={86}
                      volatility={0.004}
                      timeframe="1h"
                      chartType="line"
                      color="#B6509E"
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-6 content-start">
          {!isMobile && (
            <div className="h-full">
              <ProtocolLiquiditySummary />
            </div>
          )}

          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Top Opportunities</CardTitle>
                  <CardDescription>Highest spread trading pairs</CardDescription>
                </div>
                {!isMobile && (
                  <Button variant="outline" size="sm">
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {opportunityData.map((opportunity, index) => (
                  <OpportunityCard key={index} opportunity={opportunity} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

