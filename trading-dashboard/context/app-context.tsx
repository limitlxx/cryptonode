"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"

interface AppContextType {
  isSystemActive: boolean
  setIsSystemActive: (active: boolean) => void
  isContractPaused: boolean
  setIsContractPaused: (paused: boolean) => void
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  dismissNotification: (id: string) => void
  markAllNotificationsAsRead: () => void
  unreadNotificationsCount: number
  simulateNewOpportunity: () => void
  isLoading: boolean
}

interface Notification {
  id: string
  type: "alert" | "success" | "info" | "warning"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: {
    label: string
    onClick: () => void
  }
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isSystemActive, setIsSystemActive] = useState(true)
  const [isContractPaused, setIsContractPaused] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "warning",
      title: "High spread detected",
      message: "SUSHI/ETH pair shows 3.03% spread between Uniswap and Sushiswap",
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
    },
    {
      id: "2",
      type: "success",
      title: "Transaction completed",
      message: "Flash loan of 10 ETH has been successfully repaid",
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false,
    },
  ])
  const [isLoading, setIsLoading] = useState(true)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Automatically pause system when contract is paused
  useEffect(() => {
    if (isContractPaused && isSystemActive) {
      setIsSystemActive(false)
    }
  }, [isContractPaused, isSystemActive])

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const newNotification = {
      ...notification,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      read: false,
    }
    setNotifications((prev) => [newNotification, ...prev])

    // Play notification sound
    const audio = new Audio("/notification.mp3")
    audio.volume = 0.5
    audio.play().catch((e) => console.log("Audio play failed:", e))
  }

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  // Simulate a new trading opportunity
  const simulateNewOpportunity = () => {
    if (!isSystemActive || isContractPaused) return

    const pairs = ["ETH/USDT", "BTC/USDT", "LINK/ETH", "UNI/ETH", "SUSHI/ETH", "AAVE/ETH"]
    const exchanges = ["Uniswap", "Sushiswap", "Curve", "Balancer"]

    const randomPair = pairs[Math.floor(Math.random() * pairs.length)]
    const exchange1 = exchanges[Math.floor(Math.random() * exchanges.length)]
    let exchange2
    do {
      exchange2 = exchanges[Math.floor(Math.random() * exchanges.length)]
    } while (exchange2 === exchange1)

    // Generate a more realistic spread between 0.5% and 4.5%
    const spread = (Math.random() * 4 + 0.5).toFixed(2)

    // Create a more detailed notification
    addNotification({
      type: "alert",
      title: `New opportunity: ${randomPair}`,
      message: `${spread}% spread detected between ${exchange1} (buy) and ${exchange2} (sell)`,
      read: false,
      action: {
        label: "Trade Now",
        onClick: () => {
          console.log(`Trading ${randomPair} between ${exchange1} and ${exchange2}`)
          // You could add more functionality here to open the trade modal
        },
      },
    })

    // Play notification sound with better error handling
    try {
      const audio = new Audio("/notification.mp3")
      audio.volume = 0.5
      audio.play().catch((e) => console.log("Audio play failed:", e))
    } catch (error) {
      console.log("Audio playback not supported")
    }
  }

  return (
    <AppContext.Provider
      value={{
        isSystemActive,
        setIsSystemActive,
        isContractPaused,
        setIsContractPaused,
        notifications,
        addNotification,
        dismissNotification,
        markAllNotificationsAsRead,
        unreadNotificationsCount,
        simulateNewOpportunity,
        isLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider")
  }
  return context
}

