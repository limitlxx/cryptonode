"use client"
import { Button } from "@/components/ui/button"
import { ArrowRight, BatteryCharging } from "lucide-react"

export default function MobileNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-2 z-50 md:hidden shadow-lg">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xs text-gray-500">Starting at</span>
          <span className="text-lg font-bold text-gray-900">$299</span>
          <div className="flex items-center gap-1">
            <BatteryCharging className="h-3 w-3 text-[#F59E0B]" />
            <span className="text-xs text-[#F59E0B] font-medium">+FREE Power Bank</span>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-[#00B3E3] to-[#0077B6] hover:from-[#00B3E3] hover:to-[#005F8F] text-white border-0 rounded-full">
          Order Now <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

