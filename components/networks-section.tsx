import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function NetworksSection() {
  const networks = [
    {
      name: "Solana",
      description: "Ultra-fast blockchain with low fees",
      icon: "/solana.jpeg",
      color: "#9945FF",
      earnings: "$10-40/day",
      features: ["High throughput", "Growing ecosystem", "Popular RPC demand"],
    },
    {
      name: "Gnosis",
      description: "Secure & stable Ethereum sidechain",
      icon: "/gnosis.png",
      color: "#00B3E3",
      earnings: "$5-30/day",
      features: ["Ethereum compatibility", "Stable performance", "Reliable income"],
    },
  ]

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
          Supported Networks
        </h2>
        <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
          Our nodes are pre-configured to work with these popular blockchain networks
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {networks.map((network) => (
            <Card
              key={network.name}
              className="bg-white border-gray-200 overflow-hidden shadow-sm hover:border-[#00B3E3]/30 hover:shadow-md transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center p-2"
                    style={{ backgroundColor: `${network.color}20`, borderColor: `${network.color}30` }}
                  >
                    <Image
                      src={network.icon || "/placeholder.svg"}
                      alt={network.name}
                      width={60}
                      height={60}
                      className="rounded-full"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-gray-900">{network.name}</h3>
                      <Badge className="text-white border-0" style={{ backgroundColor: network.color }}>
                        {network.earnings}
                      </Badge>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{network.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {network.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-50 border-gray-200 text-gray-700">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            More networks coming soon! All nodes receive free updates when new networks are added.
          </p>

          <div className="mt-6 p-4 bg-[#F59E0B]/10 rounded-lg max-w-md mx-auto border border-[#F59E0B]/20">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="7" y="2" width="10" height="20" rx="2" />
                  <line x1="7" y1="7" x2="17" y2="7" />
                  <line x1="7" y1="12" x2="17" y2="12" />
                  <line x1="7" y1="17" x2="17" y2="17" />
                </svg>
              </div>
              <div className="text-left">
                <h4 className="font-bold text-gray-900">FREE Oraimo 50,000mAh Power Bank</h4>
                <p className="text-sm text-gray-600">Ensures your node stays online during power outages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

