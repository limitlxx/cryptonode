"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  BarChart3,
  ArrowLeftRight,
  Droplet,
  PenLine,
  Activity,
  Settings,
  Bot,
  Menu,
  Wallet,
  Sparkles,
} from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useAppContext } from "@/context/app-context"

interface TopNavigationProps {
  activeView: string
  setActiveView: (view: string) => void
}

export default function TopNavigation({ activeView, setActiveView }: TopNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { isSystemActive, unreadNotificationsCount } = useAppContext()

  const navItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "pairs", label: "Pairs", icon: ArrowLeftRight },
    { id: "liquidity", label: "Liquidity", icon: Droplet },
    { id: "manual", label: "Manual", icon: PenLine },
    { id: "status", label: "Status", icon: Activity },
    { id: "settings", label: "Settings", icon: Settings },
    { id: "ai-bot", label: "AI Bot", icon: Bot, badge: "Soon", highlight: true },
  ]

  const handleViewChange = (view: string) => {
    setActiveView(view)
    setMobileMenuOpen(false)
  }

  // Mobile menu
  if (isMobile) {
    return (
      <div className="flex items-center justify-between h-14 px-4 border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          <h1 className="font-bold text-lg">ArbiTrade</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {unreadNotificationsCount}
              </span>
            )}
            <div
              className={`absolute -top-1 right-6 h-2 w-2 rounded-full ${isSystemActive ? "bg-green-500" : "bg-yellow-500"}`}
            ></div>
          </div>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="pt-14">
              <ScrollArea className="h-[calc(100vh-3.5rem)]">
                <div className="grid grid-cols-2 gap-2 p-2">
                  {navItems.map((item) => (
                    <Button
                      key={item.id}
                      variant={activeView === item.id ? "default" : "outline"}
                      className={`justify-start h-14 relative ${item.highlight ? "border-primary text-primary" : ""}`}
                      onClick={() => handleViewChange(item.id)}
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <Badge className="absolute top-1 right-1 text-[10px] h-4 px-1 bg-primary/20 text-primary">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                <div className="p-4 mt-4">
                  <div className="rounded-lg bg-primary/10 p-3 flex items-center gap-2">
                    <div className="bg-primary/20 rounded-full p-1.5">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-xs">
                      <p className="font-medium">Pro Features</p>
                      <p className="text-muted-foreground">Upgrade now</p>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    )
  }

  // Desktop tabs
  return (
    <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center justify-between px-4 h-16">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 mr-4">
            <Wallet className="h-5 w-5 text-primary" />
            <h1 className="font-bold text-lg">ArbiTrade</h1>
          </div>

          <Tabs value={activeView} onValueChange={setActiveView} className="w-auto">
            <TabsList className="bg-transparent h-16 p-0 gap-1">
              {navItems.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={`relative h-16 px-4 rounded-none data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary ${item.highlight ? "text-primary" : ""}`}
                >
                  <div className="flex items-center gap-1.5">
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                    {item.badge && (
                      <Badge className="text-[10px] h-4 px-1 bg-primary/20 text-primary">{item.badge}</Badge>
                    )}
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 px-3 py-1.5 flex items-center gap-2">
            <div className="bg-primary/20 rounded-full p-1">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="text-xs">
              <p className="font-medium">Pro Features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

