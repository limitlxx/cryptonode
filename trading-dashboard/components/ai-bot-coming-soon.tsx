"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bot, Sparkles, BrainCircuit, Zap, Bell, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function AIBotComingSoon() {
  const [email, setEmail] = useState("")
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setIsSubscribed(true)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">AI Trading Bot</h1>
      </div>

      <div className="relative w-full min-h-[600px] overflow-hidden rounded-lg bg-card/50 backdrop-blur-sm border border-border">
        {/* Blurred background with mock UI elements */}
        <div className="absolute inset-0 filter blur-[8px] opacity-20 pointer-events-none">
          <div className="grid grid-cols-3 gap-4 p-6">
            {/* Mock charts and controls */}
            <div className="col-span-2 h-64 bg-primary/20 rounded-lg"></div>
            <div className="h-64 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>
            <div className="h-40 bg-primary/20 rounded-lg"></div>

            {/* Mock data table */}
            <div className="col-span-3 h-72 bg-primary/20 rounded-lg mt-4"></div>
          </div>
        </div>

        {/* Floating elements for decoration */}
        <div className="absolute top-20 left-10 transform rotate-12 hidden md:block">
          <Card className="w-40 h-24 bg-background/50 backdrop-blur-sm border-primary/20 flex items-center justify-center">
            <BrainCircuit className="h-10 w-10 text-primary/50" />
          </Card>
        </div>

        <div className="absolute bottom-40 right-20 transform -rotate-6 hidden md:block">
          <Card className="w-48 h-32 bg-background/50 backdrop-blur-sm border-primary/20 flex items-center justify-center">
            <Zap className="h-12 w-12 text-primary/50" />
          </Card>
        </div>

        {/* Main content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-2"
          >
            <Badge variant="outline" className="px-3 py-1 border-primary/30 bg-background/80 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 mr-1 text-primary" />
              New Feature
            </Badge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <Bot className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold">AI Trading Bot</h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl mb-8 max-w-2xl text-muted-foreground"
          >
            Our advanced AI trading bot is learning to identify arbitrage opportunities, optimize flash loan strategies,
            and execute trades with maximum efficiency.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative flex items-center justify-center w-full max-w-md mb-8"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/50 to-primary rounded-lg blur-md opacity-70"></div>
            <div className="relative bg-background rounded-lg p-6 text-center w-full">
              <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
              <p className="text-muted-foreground mb-0">We're putting the finishing touches on our AI trading bot.</p>
            </div>
          </motion.div>

          {!isSubscribed ? (
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              onSubmit={handleSubscribe}
              className="flex w-full max-w-md gap-2"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/80 backdrop-blur-sm"
                required
              />
              <Button type="submit">
                <Bell className="h-4 w-4 mr-2" />
                Notify Me
              </Button>
            </motion.form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-primary/10 text-primary rounded-lg p-4 max-w-md"
            >
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Thanks! We'll notify you when the AI Bot is ready.
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-12 flex flex-col items-center"
          >
            <p className="text-sm text-muted-foreground mb-2">Want to learn more about our AI capabilities?</p>
            <Button variant="link" className="gap-1">
              Read our documentation <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </motion.div>
        </div>

        {/* Animated particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-primary/30"
              initial={{
                x: `${Math.random() * 100}%`,
                y: `${Math.random() * 100}%`,
                opacity: Math.random() * 0.5 + 0.3,
              }}
              animate={{
                y: [`${Math.random() * 100}%`, `${Math.random() * 100}%`],
                opacity: [Math.random() * 0.5 + 0.3, Math.random() * 0.5 + 0.1],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <BrainCircuit className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Advanced Learning</h3>
            <p className="text-muted-foreground">
              Our AI continuously learns from market patterns and trading outcomes to improve its strategies.
            </p>
          </div>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Real-time Execution</h3>
            <p className="text-muted-foreground">
              Execute trades in milliseconds when profitable opportunities are identified across exchanges.
            </p>
          </div>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm">
          <div className="p-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Risk Management</h3>
            <p className="text-muted-foreground">
              Sophisticated risk assessment algorithms ensure optimal capital allocation and protection.
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

