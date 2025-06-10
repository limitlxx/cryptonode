// Update protocol-liquidity-summary.tsx
"use client"

import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/context/app-context';
import { ethers } from 'ethers';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts"
import { ArrowUpRight, TrendingUp, Droplet, AlertCircle } from "lucide-react"

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
  const { contract } = useAppContext();
  interface ProtocolData {
      name: string;
      description: string;
      liquidity: number;
      available: number;
      utilization: number;
      color: string;
      token: string;
      error?: boolean;
  }
  
  const [protocolData, setProtocolData] = useState<ProtocolData[]>([]);
  interface TokenData {
    name: string;
    liquidity: number;
    available: number;
    utilization: number;
    color: string;
    error?: boolean;
  }
  
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiquidityData = async () => {
      setLoading(true);
      try {
        // Get the primary token for the network (usually ETH or native token)
        // Get the active network name (ensure it's a string)
        const choosenNetwork = (contract.activeNetwork || "sepolia") as string;        
        const primaryTokenSymbol = getPrimaryTokenForNetwork(choosenNetwork);
        
        // Define protocols and their default tokens
        const protocols = [
          { 
            name: "Aave", 
            token: primaryTokenSymbol,
            description: "Lending pool liquidity"
          },
          { 
            name: "Compound", 
            token: primaryTokenSymbol,
            description: "Money market liquidity"
          },
          { 
            name: "dYdX",
            token: primaryTokenSymbol,
            description: "Margin trading liquidity",
            isMarketBased: true
          }
        ];

        const protocolResults = await Promise.all(
          protocols.map(async (protocol) => {
            const result = await contract.getProtocolLiquidity(
                protocol.name,
                protocol.token
            ) as unknown as { total: string; available: string; utilization: number };
            
            return {
              name: protocol.name,
              description: protocol.description,
              liquidity: parseFloat(ethers.formatEther(result.total)),
              available: parseFloat(ethers.formatEther(result.available)),
              utilization: result.utilization,
              color: getProtocolColor(protocol.name),
              token: protocol.token,
              error: false
            };
          })
        );

         // Get all tokens for current network
        const networkTokens = await contract.getNetworkTokens();
        const tokenSymbols = Object.keys(networkTokens);

        // Fetch token liquidity across protocols (using Aave as example)
        const tokenResults = await Promise.all(
          tokenSymbols.map(async (symbol) => {
            try {
              const result = await contract.getProtocolLiquidity('Aave', symbol) as unknown as { total: string; available: string; utilization: number };;
              return {
                name: symbol,
                liquidity: parseFloat(ethers.formatEther(result.total)),
                available: parseFloat(ethers.formatEther(result.available)),
                utilization: result.utilization,
                color: getTokenColor(symbol)
              };
            } catch (error) {
              console.error(`Error fetching liquidity for ${symbol}:`, error);
              return {
                name: symbol,
                liquidity: 0,
                available: 0,
                utilization: 0,
                color: getTokenColor(symbol),
                error: true
              };
            }
          })
        );

        setProtocolData(protocolResults.filter(p => !p.error));
        setTokenData(tokenResults.filter(t => !t.error));
      } catch (error) {
        console.error("Error fetching liquidity data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLiquidityData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchLiquidityData, 30000);
    return () => clearInterval(interval);
  }, [contract]);   

   // Helper functions
   function getPrimaryTokenForNetwork(network: string): string {
    switch (network.toLowerCase()) {
      case 'ethereum': return 'ETH';
      case 'arbitrum': return 'ETH';
      case 'optimism': return 'ETH';
      case 'polygon': return 'MATIC';
      case 'avalanche': return 'AVAX';
      case 'bsc': return 'BNB';
      default: return 'ETH';
    }
  }

  function getDefaultPairForNetwork(network: string): string {
    switch (network.toLowerCase()) {
      case 'ethereum': return 'ETH-USDC';
      case 'arbitrum': return 'ETH-USDC';
      case 'optimism': return 'ETH-USDC';
      case 'polygon': return 'MATIC-USDC';
      case 'avalanche': return 'AVAX-USDC';
      case 'bsc': return 'BNB-BUSD';
      default: return 'ETH-USDC';
    }
  }

  const getProtocolColor = (name: string) => {
    switch (name.toLowerCase()) {
      case 'aave': return '#B6509E';
      case 'compound': return '#00D395';
      case 'dydx': return '#6966FF';
      case 'uniswap': return '#FF007A';
      default: return '#8884d8';
    }
  };

  const getTokenColor = (symbol: string) => {
    switch (symbol) {
      case 'ETH': return '#627EEA';
      case 'USDC': return '#2775CA';
      case 'DAI': return '#F5AC37';
      case 'WBTC': return '#F7931A';
      default: return '#8884d8';
    }
  };

  // Calculate totals
  const totalLiquidity = protocolData.reduce((sum, item) => sum + item.liquidity, 0);
  const averageUtilization = protocolData.length > 0 
    ? Math.round(protocolData.reduce((sum, item) => sum + item.utilization, 0) / protocolData.length)
    : 0;

  // Find protocol with highest utilization
  const highestUtilization = protocolData.reduce((prev, current) =>
      (prev.utilization > current.utilization ? prev : current), { name: '', utilization: 0 });

  if (loading) {
    return <div className="p-4 text-center">Loading liquidity data...</div>;
  }

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