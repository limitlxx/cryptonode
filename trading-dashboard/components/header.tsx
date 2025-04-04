"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAppContext } from "@/context/app-context"
import EmergencyPause from "./emergency-pause"
import { Bell, Menu, X } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import WalletConnection from "./wallet-connection"

interface HeaderProps {
  onToggleSidebar: () => void
  isSidebarOpen: boolean
  onToggleNotifications: () => void
}

export default function Header({ onToggleSidebar, isSidebarOpen, onToggleNotifications }: HeaderProps) {
  const { unreadNotificationsCount } = useAppContext()
  const [isScrolled, setIsScrolled] = useState(false)

  // Add scroll event listener
  if (typeof window !== "undefined") {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 10) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    })
  }

  return (
    <header
      className={`sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 ${
        isScrolled ? "shadow-sm" : ""
      }`}
    >
      <Button variant="outline" size="icon" className="shrink-0 md:hidden" onClick={onToggleSidebar}>
        {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="flex-1">
        <h1 className="text-xl font-semibold">Ethereum Arbitrage Bot</h1>
      </div>

      <div className="flex items-center gap-2">
        <EmergencyPause />

        <WalletConnection />

        <Button variant="outline" size="icon" className="relative" onClick={onToggleNotifications}>
          {unreadNotificationsCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
              variant="destructive"
            >
              {unreadNotificationsCount}
            </Badge>
          )}
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
        </Button>
      </div>
    </header>
  )
}

