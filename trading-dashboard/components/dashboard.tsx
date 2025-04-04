"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import MarketOverview from "@/components/market-overview"
import TradingPairs from "@/components/trading-pairs"
import SystemStatus from "@/components/system-status"
import SettingsPanel from "@/components/settings-panel"
import LiquidityPools from "@/components/liquidity-pools"
import ManualOpportunity from "@/components/manual-opportunity"
import AIBotComingSoon from "@/components/ai-bot-coming-soon"
import Header from "@/components/header"
import TopNavigation from "@/components/top-navigation"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAppContext } from "@/context/app-context"
import ContractStatusBanner from "./contract-status-banner"
import TradeBotSimulator from "./trade-bot-simulator"

export default function Dashboard() {
  const { isSystemActive, setIsSystemActive, isLoading, simulateNewOpportunity, isContractPaused } = useAppContext()
  const [activeView, setActiveView] = useState("overview")
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Simulate new opportunities periodically when system is active
  useEffect(() => {
    if (!isSystemActive || isContractPaused) return

    // Simulate a new opportunity every 30-90 seconds
    const intervalId = setInterval(
      () => {
        simulateNewOpportunity()
      },
      Math.random() * 60000 + 30000,
    )

    return () => clearInterval(intervalId)
  }, [isSystemActive, simulateNewOpportunity, isContractPaused])

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <ContractStatusBanner />
      <TopNavigation activeView={activeView} setActiveView={setActiveView} />

      {!isMobile && <Header />}

      <main className="flex-1 p-4 md:p-6 pb-16 max-w-[1600px] mx-auto w-full">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          {activeView === "overview" && <MarketOverview />}
          {activeView === "pairs" && <TradingPairs />}
          {activeView === "liquidity" && <LiquidityPools />}
          {activeView === "manual" && <ManualOpportunity />}
          {activeView === "status" && <SystemStatus />}
          {activeView === "settings" && <SettingsPanel />}
          {activeView === "ai-bot" && <AIBotComingSoon />}
        </motion.div>
      </main>
      <TradeBotSimulator />
    </div>
  )
}

