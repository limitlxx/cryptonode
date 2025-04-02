import { Shield, Clock, Headphones } from "lucide-react"

export default function TrustBadges() {
  return (
    <div className="bg-white py-6 px-4 border-y border-gray-200">
      <div className="container mx-auto">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#00B3E3]/20 flex items-center justify-center mb-2">
              <Shield className="h-5 w-5 text-[#00B3E3]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Pre-configured</h3>
            <p className="text-gray-500 text-xs hidden md:block">Ready to use</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#6B46C1]/20 flex items-center justify-center mb-2">
              <Headphones className="h-5 w-5 text-[#6B46C1]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">24/7 Support</h3>
            <p className="text-gray-500 text-xs hidden md:block">Always available</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-[#10B981]/20 flex items-center justify-center mb-2">
              <Clock className="h-5 w-5 text-[#10B981]" />
            </div>
            <h3 className="text-sm font-semibold text-gray-900">Profit Guide</h3>
            <p className="text-gray-500 text-xs hidden md:block">Maximize earnings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

