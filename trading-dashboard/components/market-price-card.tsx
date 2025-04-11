"use client"

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import { fetchMarketPrices } from "@/lib/market-prices";
import { useAppContext } from "@/context/app-context";

interface MarketPriceCardProps {
  symbol: string;
  showViewAll?: boolean;
}

export default function MarketPriceCard({ symbol, showViewAll = true }: MarketPriceCardProps) {
  const [priceData, setPriceData] = useState<{
    price: number;
    change24h: number;
    volume: number;
  } | null>(null);
  const { isLoading } = useAppContext();

  useEffect(() => {
    const loadPrice = async () => {
      const prices = await fetchMarketPrices();
      const tokenPrice = prices.find(p => p.symbol === symbol);
      
      if (tokenPrice) {
        setPriceData({
          price: tokenPrice.price,
          change24h: tokenPrice.change24h,
          volume: tokenPrice.volume24h
        });
      }
    };

    loadPrice();
    const interval = setInterval(loadPrice, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [symbol]);

  if (isLoading || !priceData) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{symbol} Price</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[100px] flex items-center justify-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isPositive = priceData.change24h >= 0;
  const volumeInMillions = (priceData.volume / 1000000).toFixed(2);

  return (
    <Card className="bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{symbol} Price</CardTitle>
          {showViewAll && (
            <Badge variant="outline" className="gap-1">
              <ArrowUpRight className="h-3.5 w-3.5" />
              View All
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-3xl font-bold">
              ${priceData.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: priceData.price < 1 ? 6 : 2
              })}
            </div>
            <div className={`flex items-center mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {Math.abs(priceData.change24h).toFixed(2)}%
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <div>24h Volume</div>
            <div className="text-right">${volumeInMillions}M</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}