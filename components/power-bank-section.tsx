import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Check, BatteryCharging } from "lucide-react"

export default function PowerBankSection() {
  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="lg:w-1/2">
            <Badge className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50 mb-3">FREE WITH EVERY PURCHASE</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Oraimo 50,000mAh Power Bank Included</h2>
            <p className="text-gray-600 mb-6">
              We understand that consistent uptime is crucial for maximizing your crypto node earnings. That's why we're
              including a premium Oraimo 50,000mAh power bank with every node purchase, ensuring your node stays online even
              during power outages.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#10B981] mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Uninterrupted Earnings</h3>
                  <p className="text-sm text-gray-600">Keep earning even during power outages</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#10B981] mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Massive Oraimo 50,000mAh Capacity</h3>
                  <p className="text-sm text-gray-600">Provides hours of backup power for your node</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#10B981] mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">Fast Charging Technology</h3>
                  <p className="text-sm text-gray-600">Quickly recharges when power is restored</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Check className="h-5 w-5 text-[#10B981] mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900">$9 Value - Yours FREE</h3>
                  <p className="text-sm text-gray-600">Limited time offer with every node purchase</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2">
            <div className="relative h-[400px] w-full rounded-xl overflow-hidden border border-gray-200 shadow-md">
              <Image
                src="/battery.jpg"
                alt="Oraimo 50,000mAh Power Bank"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-6">
                <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <BatteryCharging className="h-5 w-5 text-[#F59E0B]" />
                    <span className="font-medium text-gray-900">Oraimo 50,000mAh Power Bank</span>
                  </div>
                  <p className="text-sm text-gray-600">Retail Value: $59 - Yours FREE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

