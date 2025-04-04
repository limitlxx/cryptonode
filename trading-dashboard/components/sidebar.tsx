"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  ArrowLeftRight,
  Droplet,
  PenLine,
  Activity,
  Settings,
  Bot,
  ChevronLeft,
  ChevronRight,
  Wallet,
  Sparkles,
} from "lucide-react"

interface SidebarProps {
  activeView: string
  setActiveView: (view: string) => void
}

export default function Sidebar({ activeView, setActiveView }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { id: "overview", label: "Market Overview", icon: BarChart3 },
    { id: "pairs", label: "Trading Pairs", icon: ArrowLeftRight },
    { id: "liquidity", label: "Liquidity Pools", icon: Droplet },
    { id: "manual", label: "Manual Entry", icon: PenLine },
    { id: "status", label: "System Status", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "ai-bot", label: "AI Bot", icon: Bot, badge: "Soon" },
  ]

  return (
    <div
      className={cn(
        "h-screen bg-card border-r border-border flex flex-col transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div
        className={cn(
          "h-16 flex items-center px-4 border-b border-border",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">ArbiTrade</h1>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.id}
              variant={activeView === item.id ? "secondary" : "ghost"}
              className={cn("w-full justify-start h-10", collapsed ? "px-2" : "px-3")}
              onClick={() => setActiveView(item.id)}
            >
              <item.icon className={cn("h-5 w-5", activeView === item.id ? "text-primary" : "text-muted-foreground")} />

              {!collapsed && <span className="ml-3">{item.label}</span>}

              {!collapsed && item.badge && (
                <Badge variant="outline" className="ml-auto bg-primary/10 text-primary text-xs">
                  {item.badge}
                </Badge>
              )}

              {collapsed && item.badge && (
                <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary"></div>
              )}
            </Button>
          ))}
        </nav>
      </ScrollArea>

      <div className={cn("p-4 border-t border-border", collapsed ? "text-center" : "")}>
        <div className={cn("rounded-lg bg-primary/10 p-3", collapsed ? "px-2" : "px-3")}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="bg-primary/20 rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div className="text-xs">
                <p className="font-medium">Pro Features</p>
                <p className="text-muted-foreground">Upgrade now</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="bg-primary/20 rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

