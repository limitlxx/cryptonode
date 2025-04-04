"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ArrowUpDown, TrendingUp, TrendingDown, ExternalLink } from "lucide-react"
import QuickTradeModal from "./quick-trade-modal"
import { Skeleton } from "@/components/ui/skeleton"

// Sample data
const tradingPairsData = [
  {
    id: 1,
    pair: "ETH/USDT",
    exchange1: "Uniswap",
    price1: 3520,
    exchange2: "Sushiswap",
    price2: 3518,
    spread: 0.06,
    status: "active",
  },
  {
    id: 2,
    pair: "BTC/USDT",
    exchange1: "Uniswap",
    price1: 65700,
    exchange2: "Sushiswap",
    price2: 65720,
    spread: 0.03,
    status: "active",
  },
  {
    id: 3,
    pair: "UNI/ETH",
    exchange1: "Uniswap",
    price1: 0.00152,
    exchange2: "Sushiswap",
    price2: 0.00151,
    spread: 0.66,
    status: "active",
  },
  {
    id: 4,
    pair: "AAVE/ETH",
    exchange1: "Uniswap",
    price1: 0.0242,
    exchange2: "Sushiswap",
    price2: 0.0241,
    spread: 0.41,
    status: "active",
  },
  {
    id: 5,
    pair: "LINK/ETH",
    exchange1: "Uniswap",
    price1: 0.00412,
    exchange2: "Sushiswap",
    price2: 0.0041,
    spread: 0.49,
    status: "active",
  },
  {
    id: 6,
    pair: "SUSHI/ETH",
    exchange1: "Uniswap",
    price1: 0.00032,
    exchange2: "Sushiswap",
    price2: 0.00033,
    spread: 3.03,
    status: "opportunity",
  },
  {
    id: 7,
    pair: "COMP/ETH",
    exchange1: "Uniswap",
    price1: 0.0121,
    exchange2: "Sushiswap",
    price2: 0.0122,
    spread: 0.82,
    status: "active",
  },
  {
    id: 8,
    pair: "SNX/ETH",
    exchange1: "Uniswap",
    price1: 0.00072,
    exchange2: "Sushiswap",
    price2: 0.00074,
    spread: 2.7,
    status: "opportunity",
  },
]

interface TradingPairsProps {
  isLoading?: boolean
}

export default function TradingPairs({ isLoading = false }: TradingPairsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedPair, setSelectedPair] = useState<(typeof tradingPairsData)[0] | null>(null)

  const filteredPairs = tradingPairsData.filter((pair) => pair.pair.toLowerCase().includes(searchTerm.toLowerCase()))

  const handleTradeClick = (pair: (typeof tradingPairsData)[0]) => {
    setSelectedPair(pair)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Trading Pairs</h1>
      </div>

      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Trading Pairs</CardTitle>
              <CardDescription>Monitor price differences across exchanges</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search pairs..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4 py-3">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[50px]" />
                  <Skeleton className="h-4 w-[70px]" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead>Exchange 1</TableHead>
                  <TableHead>Price 1</TableHead>
                  <TableHead>Exchange 2</TableHead>
                  <TableHead>Price 2</TableHead>
                  <TableHead>Spread (%)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPairs.map((pair) => (
                  <TableRow key={pair.id}>
                    <TableCell className="font-medium">{pair.pair}</TableCell>
                    <TableCell>{pair.exchange1}</TableCell>
                    <TableCell>
                      ${typeof pair.price1 === "number" && pair.price1 < 0.01 ? pair.price1.toFixed(6) : pair.price1}
                    </TableCell>
                    <TableCell>{pair.exchange2}</TableCell>
                    <TableCell>
                      ${typeof pair.price2 === "number" && pair.price2 < 0.01 ? pair.price2.toFixed(6) : pair.price2}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {pair.spread > 1 ? (
                          <TrendingUp className="h-4 w-4 mr-1 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1 text-muted-foreground" />
                        )}
                        {pair.spread.toFixed(2)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      {pair.status === "opportunity" ? (
                        <Badge className="bg-green-500">Opportunity</Badge>
                      ) : (
                        <Badge variant="outline">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleTradeClick(pair)}
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Trade</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <QuickTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} tradingPair={selectedPair} />
    </div>
  )
}

