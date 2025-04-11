import { AppProvider } from "@/context/app-context"
import Dashboard from "@/components/dashboard"
import TransactionTray from "@/components/transaction-tray"
import { NetworkStatusIndicator } from "@/components/network-status-indicator"


export default function Home() {
  
  return (
    <AppProvider>
      <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <Dashboard />
        <NetworkStatusIndicator />
        <TransactionTray />
      </main>
    </AppProvider>
  )
}

