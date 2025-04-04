"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPanel() {
  const [minSpread, setMinSpread] = useState(0.5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Settings</CardTitle>
        <CardDescription>Configure system parameters and preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="trading">Trading</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6 space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select defaultValue="default">
                    <SelectTrigger id="color-scheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                      <SelectItem value="chocolate">Chocolate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="refresh-rate">Data Refresh Rate (seconds)</Label>
                  <Input id="refresh-rate" type="number" defaultValue="5" min="1" max="60" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-start">Auto-start system on launch</Label>
                  <Switch id="auto-start" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="analytics">Enable analytics</Label>
                  <Switch id="analytics" defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="trading" className="mt-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Minimum Spread Threshold (%): {minSpread.toFixed(2)}%</Label>
                <Slider
                  value={[minSpread]}
                  min={0.1}
                  max={5}
                  step={0.1}
                  onValueChange={(value) => setMinSpread(value[0])}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gas-limit">Gas Limit</Label>
                  <Input id="gas-limit" type="number" defaultValue="300000" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-slippage">Max Slippage (%)</Label>
                  <Input id="max-slippage" type="number" defaultValue="0.5" step="0.1" min="0.1" max="5" />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-execute">Auto-execute trades</Label>
                  <Switch id="auto-execute" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max-trade">Maximum Trade Size (ETH)</Label>
                <Input id="max-trade" type="number" defaultValue="5" step="0.1" min="0.1" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="mt-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="network">Primary Network</Label>
                <Select defaultValue="ethereum">
                  <SelectTrigger id="network">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum Mainnet</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rpc-url">Custom RPC URL</Label>
                <Input id="rpc-url" placeholder="https://..." />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="private-tx">Use private transactions</Label>
                  <Switch id="private-tx" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-gas">Auto-adjust gas price</Label>
                  <Switch id="auto-gas" defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="mt-6 space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-trades">Notify on trades</Label>
                  <Switch id="notify-trades" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-errors">Notify on errors</Label>
                  <Switch id="notify-errors" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notify-opportunities">Notify on opportunities</Label>
                  <Switch id="notify-opportunities" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email for notifications</Label>
                <Input id="email" type="email" placeholder="your@email.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-channel">Notification Channel</Label>
                <Select defaultValue="email">
                  <SelectTrigger id="notification-channel">
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="telegram">Telegram</SelectItem>
                    <SelectItem value="discord">Discord</SelectItem>
                    <SelectItem value="slack">Slack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </CardFooter>
    </Card>
  )
}

