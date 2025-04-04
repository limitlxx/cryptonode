import { AppProvider } from "@/context/app-context"
import Dashboard from "@/components/dashboard"
import TransactionTray from "@/components/transaction-tray"

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen bg-gradient-to-b from-background to-background/95">
        <Dashboard />
        <TransactionTray />
      </main>
    </AppProvider>
  )
}

