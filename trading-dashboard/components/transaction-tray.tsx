"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronUp, ChevronDown, XCircle, ArrowRightLeft, Wallet, ExternalLink, Filter, Pin } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

// Sample transaction data
const transactionData = [
  {
    id: "tx1",
    type: "swap",
    description: "Swap ETH for USDC",
    amount: "2.5 ETH → 8,750 USDC",
    status: "completed",
    timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    hash: "0x1a2b3c...",
    isNew: true,
    isPinned: false,
  },
  {
    id: "tx2",
    type: "flashLoan",
    description: "Flash Loan from Aave",
    amount: "10 ETH",
    status: "pending",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    hash: "0x4d5e6f...",
    isNew: true,
    isPinned: true,
  },
  {
    id: "tx3",
    type: "arbitrage",
    description: "Uniswap → Sushiswap",
    amount: "SUSHI/ETH",
    status: "completed",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    hash: "0x7g8h9i...",
    isNew: false,
    isPinned: false,
  },
  {
    id: "tx4",
    type: "swap",
    description: "Swap USDC for DAI",
    amount: "5,000 USDC → 4,995 DAI",
    status: "failed",
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    hash: "0xj0k1l2...",
    error: "Slippage tolerance exceeded",
    isNew: false,
    isPinned: false,
  },
]

// Group transactions by date
function groupTransactionsByDate(transactions: typeof transactionData) {
  const groups: Record<string, typeof transactionData> = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    let groupKey: string

    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday"
    } else {
      groupKey = date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    }

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }

    groups[groupKey].push(transaction)
  })

  return groups
}

// Format relative time
function formatRelativeTime(timestamp: string) {
  const date = new Date(timestamp)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`
  } else if (diffInSeconds < 3600) {
    return `${Math.floor(diffInSeconds / 60)}m ago`
  } else if (diffInSeconds < 86400) {
    return `${Math.floor(diffInSeconds / 3600)}h ago`
  } else {
    return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })
  }
}

// Transaction icon based on type
function TransactionIcon({ type }: { type: string }) {
  switch (type) {
    case "swap":
      return <ArrowRightLeft className="h-4 w-4" />
    case "flashLoan":
      return <Wallet className="h-4 w-4" />
    case "arbitrage":
      return <ArrowRightLeft className="h-4 w-4 rotate-45" />
    default:
      return <ArrowRightLeft className="h-4 w-4" />
  }
}

// Transaction status icon and color
function StatusIndicator({ status, error }: { status: string; error?: string }) {
  switch (status) {
    case "pending":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <div className="h-2.5 w-2.5 rounded-full bg-yellow-400"></div>
                  <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-yellow-400 animate-ping opacity-75"></div>
                </div>
                <span className="text-xs font-medium text-yellow-600">Pending</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Transaction is being processed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    case "completed":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-green-500"></div>
                <span className="text-xs font-medium text-green-600">Completed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Transaction successfully completed</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    case "failed":
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500"></div>
                <span className="text-xs font-medium text-red-600">Failed</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>{error || "Transaction failed"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    default:
      return (
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-gray-400"></div>
          <span className="text-xs font-medium text-gray-600">Unknown</span>
        </div>
      )
  }
}

// Transaction item component
function TransactionItem({
  transaction,
  onPin,
  isMobile,
}: {
  transaction: (typeof transactionData)[0]
  onPin: (id: string) => void
  isMobile: boolean
}) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: transaction.isNew ? 0 : 1, y: transaction.isNew ? -10 : 0 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "relative px-3 py-2 rounded-lg transition-colors",
        isHovered ? "bg-accent/50" : transaction.isPinned ? "bg-accent/30" : "bg-transparent",
        transaction.isNew && "border-l-2 border-primary",
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center h-8 w-8 rounded-full",
              transaction.status === "pending"
                ? "bg-yellow-100"
                : transaction.status === "completed"
                  ? "bg-green-100"
                  : transaction.status === "failed"
                    ? "bg-red-100"
                    : "bg-primary/10",
            )}
          >
            <TransactionIcon type={transaction.type} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium truncate">{transaction.description}</p>
              {transaction.isPinned && <Pin className="h-3 w-3 text-primary fill-primary" />}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{transaction.amount}</span>
              <span>•</span>
              <span>{formatRelativeTime(transaction.timestamp)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <StatusIndicator status={transaction.status} error={transaction.error} />

          {!isMobile && (
            <AnimatePresence>
              {(isHovered || transaction.isPinned) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center"
                >
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onPin(transaction.id)}>
                          <Pin className={cn("h-3.5 w-3.5", transaction.isPinned && "fill-primary text-primary")} />
                          <span className="sr-only">{transaction.isPinned ? "Unpin" : "Pin"}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>{transaction.isPinned ? "Unpin transaction" : "Pin transaction"}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span className="sr-only">View on Etherscan</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top">
                        <p>View on Etherscan</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  {transaction.status === "pending" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500">
                            <XCircle className="h-3.5 w-3.5" />
                            <span className="sr-only">Cancel</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p>Cancel transaction</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function TransactionTray() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [newCount, setNewCount] = useState(0)
  const [filter, setFilter] = useState("all")
  const [transactions, setTransactions] = useState(transactionData)
  const trayRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "t" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setIsExpanded((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  // Count pending and new transactions
  useEffect(() => {
    const pendingCount = transactions.filter((tx) => tx.status === "pending").length
    const newCount = transactions.filter((tx) => tx.isNew).length
    setPendingCount(pendingCount)
    setNewCount(newCount)
  }, [transactions])

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true
    if (filter === "pending") return tx.status === "pending"
    if (filter === "completed") return tx.status === "completed"
    if (filter === "failed") return tx.status === "failed"
    return true
  })

  // Group transactions
  const groupedTransactions = groupTransactionsByDate(filteredTransactions)

  // Handle pin/unpin
  const handlePin = (id: string) => {
    setTransactions((prev) =>
      prev
        .map((tx) => (tx.id === id ? { ...tx, isPinned: !tx.isPinned } : tx))
        .sort((a, b) => {
          // Sort pinned items first
          if (a.isPinned && !b.isPinned) return -1
          if (!a.isPinned && b.isPinned) return 1

          // Then sort by timestamp (newest first)
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        }),
    )
  }

  // Mark all as read
  const markAllAsRead = () => {
    setTransactions((prev) => prev.map((tx) => ({ ...tx, isNew: false })))
  }

  return (
    <div
      ref={trayRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 transition-all duration-300 z-30",
        "backdrop-blur-md bg-background/80 border-t border-border shadow-lg",
        isExpanded ? (isMobile ? "h-[70vh]" : "h-80") : "h-12",
      )}
    >
      {/* Header */}
      <div
        className="h-12 px-4 flex items-center justify-between cursor-pointer hover:bg-accent/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium">Transactions</h3>
          <div className="flex items-center gap-1.5">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                {pendingCount} pending
              </Badge>
            )}
            {newCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                {newCount} new
              </Badge>
            )}
          </div>
          {!isMobile && (
            <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground ml-2">
              <span className="text-xs">⌘</span>T
            </kbd>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isExpanded && newCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="text-xs h-7">
              Mark all as read
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Transaction list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-2 border-b border-border">
              <Tabs defaultValue="all" value={filter} onValueChange={setFilter}>
                <TabsList className="h-8 w-full grid grid-cols-4">
                  <TabsTrigger value="all" className="text-xs h-7">
                    All
                  </TabsTrigger>
                  <TabsTrigger value="pending" className="text-xs h-7">
                    Pending
                  </TabsTrigger>
                  <TabsTrigger value="completed" className="text-xs h-7">
                    Completed
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="text-xs h-7">
                    Failed
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <ScrollArea className={isMobile ? "h-[calc(70vh-5.5rem)]" : "h-[calc(100%-5.5rem)]"}>
              <div className="p-3 space-y-4">
                {Object.entries(groupedTransactions).map(([date, txs]) => (
                  <div key={date}>
                    <div className="flex items-center gap-2 mb-2 px-3">
                      <h4 className="text-xs font-medium text-muted-foreground">{date}</h4>
                      <div className="h-px flex-1 bg-border"></div>
                    </div>
                    <div className="space-y-1">
                      {txs.map((transaction) => (
                        <TransactionItem
                          key={transaction.id}
                          transaction={transaction}
                          onPin={handlePin}
                          isMobile={isMobile}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                {Object.keys(groupedTransactions).length === 0 && (
                  <div className="flex flex-col items-center justify-center h-40 text-center">
                    <div className="rounded-full bg-muted p-3 mb-3">
                      <Filter className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h4 className="text-sm font-medium mb-1">No transactions found</h4>
                    <p className="text-xs text-muted-foreground">Try changing your filter or check back later</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

