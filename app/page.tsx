import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Check, ChevronRight, Phone, Sparkles } from "lucide-react"
import ProductCard from "@/components/product-card"
import EarningsChart from "@/components/earnings-chart"
import TrustBadges from "@/components/trust-badges"
import FAQ from "@/components/faq"
import SocialProof from "@/components/social-proof"
import NetworksSection from "@/components/networks-section"
import PowerBankSection from "@/components/power-bank-section"
import MobileNav from "@/components/mobile-nav"

export default function Home() {
  const products = [
    {
      id: 1,
      name: "Basic Node",
      type: "Raspberry Pi 5",
      specs: ["16GB RAM", "1TB SSD", "Pre-configured software", "Basic support package", "Only Gnosis ready"],
      price: 699,
      originalPrice: 899,
      dailyEarnings: "$5-$20",
      // image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 2,
      name: "Pro Node",
      type: "Raspberry Pi 5",
      specs: [
        "16GB RAM",
        "1TB SSD",
        "Pre-configured software",
        "Priority support",
        "Advanced profit guide",
        "Solana & Gnosis optimized",
      ],
      price: 799,
      originalPrice: 1299,
      dailyEarnings: "$15-$40",
      // image: "/placeholder.svg?height=200&width=200",
      featured: true,
    },
    {
      id: 3,
      name: "Enterprise Node",
      type: "Custom Hardware",
      specs: [
        "16GB RAM",
        "2TB SSD",
        "Pre-configured software",
        "24/7 Premium support",
        "Advanced profit guide",
        "Scaling strategies",
        "Multi-network support (Solana, Gnosis & more)",
      ],
      price: 1199,
      originalPrice: 1499,
      dailyEarnings: "$30-$100",
      // image: "/placeholder.svg?height=200&width=200",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 text-gray-900">
      {/* Hero Section */}
      <section className="relative py-12 px-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,179,227,0.4),transparent_40%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(107,70,193,0.4),transparent_40%)]"></div>
        </div>

        <div className="container mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-6">
            <div className="lg:w-1/2 space-y-3">
              <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/50 mb-2">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> Limited Drop
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
                Earn $5–$100/Day with a Plug-and-Play Crypto Node!
              </h1>
              <p className="text-lg md:text-xl text-gray-700">No coding. No mining. Just plug in and profit!</p>
              <div className="flex flex-row gap-3 pt-3">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00B3E3] to-[#0077B6] hover:from-[#00B3E3] hover:to-[#005F8F] text-white border-0 rounded-full px-6"
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="rounded-full border-[#00B3E3]/50 text-[#00B3E3] hover:bg-[#00B3E3]/10"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="lg:w-1/2 relative mt-6 lg:mt-0">
              <div className="relative w-full h-[450px] md:h-[550px] rounded-2xl overflow-hidden border border-[#00B3E3]/20 shadow-[0_0_30px_rgba(0,179,227,0.15)]">
                <Image
                  src="/node1.jpg"
                  alt="Raspberry Pi Crypto Node"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end p-4">
                  <div className="flex gap-2 items-center">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/10 text-white">
                      Solana Ready
                    </Badge>
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-sm border-white/10 text-white">
                      Gnosis Ready
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 -right-3 flex gap-2">
                <div className="flex -space-x-2">
                  <Image
                    src="/solana.jpeg"
                    alt="Solana"
                    width={40}
                    height={40}
                    className="rounded-full bg-[#9945FF]/10 p-1 border border-[#9945FF]/30"
                  />
                  <Image
                    src="/gnosis.png"
                    alt="Gnosis"
                    width={40}
                    height={40}
                    className="rounded-full bg-[#00B3E3]/10 p-1 border border-[#00B3E3]/30"
                  />
                  {/* <Image
                    src="/placeholder.svg?height=40&width=40"
                    alt="XRP"
                    width={40}
                    height={40}
                    className="rounded-full bg-white/10 p-1 border border-gray-200"
                  /> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <TrustBadges />

      {/* Power Bank Promo */}
      <section className="py-6 px-4 bg-[#F59E0B]/10 border-y border-[#F59E0B]/20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center md:text-left">
            <div className="flex-shrink-0">
              <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 px-3 py-1 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1" /> LIMITED TIME OFFER
              </Badge>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">
              FREE Oraimo 50,000mAh Power Bank with Every Node Purchase!
            </h3>
            <p className="text-gray-600 text-sm md:text-base">Keep your node running 24/7 even during power outages</p>
          </div>
        </div>
      </section>

      {/* Networks Section */}
      <NetworksSection />

      {/* How It Works */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#00B3E3] to-[#0077B6]"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-7 h-7 rounded-full bg-[#00B3E3]/20 flex items-center justify-center text-[#00B3E3] font-bold text-sm">
                    1
                  </div>
                  Plug & Play
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Pre-loaded with all software. Just connect power & internet and you're set!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#0077B6] to-[#6B46C1]"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-7 h-7 rounded-full bg-[#0077B6]/20 flex items-center justify-center text-[#0077B6] font-bold text-sm">
                    2
                  </div>
                  Earn Passively
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">
                  Generate income 24/7 through RPC access or staking. Money while you sleep!
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
              <div className="h-1.5 bg-gradient-to-r from-[#6B46C1] to-[#9333EA]"></div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <div className="w-7 h-7 rounded-full bg-[#6B46C1]/20 flex items-center justify-center text-[#6B46C1] font-bold text-sm">
                    3
                  </div>
                  Zero Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm">Step-by-step guides & 24/7 support. We've got your back!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
            Choose Your Node
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Select the perfect crypto node for your investment goals. All nodes come pre-configured and ready to earn
            from day one.
          </p>

          <div className="grid md:grid-cols-3 gap-4 lg:gap-8">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Earnings Potential */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="container mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
                Potential Earnings
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="text-[#10B981] mt-1 h-5 w-5" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">$5–$20/day from RPC API access</h3>
                    <p className="text-gray-600">
                      Provide API endpoints for developers and earn consistent daily income.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-[#10B981] mt-1 h-5 w-5" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">$30–$100/day with scaling</h3>
                    <p className="text-gray-600">
                      Run multiple nodes or upgrade to our Enterprise solution for maximum earnings.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="text-[#10B981] mt-1 h-5 w-5" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">Passive income 24/7</h3>
                    <p className="text-gray-600">
                      Your node works around the clock, generating income even while you sleep.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <p className="text-[#00B3E3] font-semibold">Monthly Potential:</p>
                <p className="text-2xl font-bold">$150 - $3,000</p>
                <p className="text-gray-500 text-sm">Results may vary based on network conditions and configuration</p>
              </div>
            </div>

            <div className="lg:w-1/2">
              {/* <EarningsChart /> */}
              {/* Social Proof */}
      <SocialProof />
            </div>
          </div>
        </div>
      </section>


      {/* Power Bank Section */}
      <PowerBankSection />

      {/* FAQ */}
      <FAQ />

      {/* CTA */}
      <section className="py-12 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#00B3E3]/10 to-[#6B46C1]/10 p-6 md:p-8 border border-gray-200 shadow-lg">
            <div className="absolute inset-0 z-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(0,179,227,0.3),transparent_40%)]"></div>
              <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_70%,rgba(107,70,193,0.3),transparent_40%)]"></div>
            </div>

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-4">
                <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 px-3 py-1">
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Only 10 Units Left
                </Badge>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center text-gray-900">Limited-Time Offer</h2>
              <p className="text-lg text-center text-gray-700 mb-6">
                First 10 buyers get FREE setup support + 10% discount + FREE Oraimo 50,000mAh Power Bank!
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3 mb-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00B3E3] to-[#0077B6] hover:from-[#00B3E3] hover:to-[#005F8F] text-white border-0 rounded-full"
                >
                  Order Now <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {/* <Button
                  size="lg"
                  variant="outline"
                  className="border-[#00B3E3]/50 text-[#00B3E3] hover:bg-[#00B3E3]/10 rounded-full"
                >
                  <Phone className="mr-2 h-4 w-4" /> Call Now
                </Button> */}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-20 h-20 bg-white p-2 rounded-lg shadow-sm">
                    <Image src="/wa.link_wpm9xj.png" alt="QR Code" width={80} height={80} />
                  </div>
                  <p className="text-sm text-gray-600">Scan to order</p>
                </div>

                <div className="text-center sm:text-left">
                  <p className="text-gray-600 text-sm">Or contact us directly:</p>
                  <p className="text-lg font-semibold flex items-center gap-2 text-gray-900">
                    <Phone className="h-4 w-4" /> WhatsApp: +2348087400366
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-gray-200 bg-white">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500">© 2025 Earlystore__. All rights reserved.</p>
            {/* <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                Terms
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                Privacy
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-900">
                Contact
              </Button>
            </div> */}
          </div>
        </div>
      </footer>

      {/* Mobile Sticky Nav */}
      <MobileNav />
    </div>
  )
}

