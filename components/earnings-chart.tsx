"use client"

import { Card } from "@/components/ui/card"

export default function EarningsChart() {
  return (
    <Card className="bg-white border-gray-200 p-4 shadow-sm">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Monthly Earnings Potential</h3>

      <div className="h-[300px] w-full relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
        {/* Static chart representation instead of dynamic chart */}
        <div className="absolute inset-0 flex items-end p-4">
          <div className="w-full flex items-end justify-between gap-2 h-[220px]">
            {/* Basic Node Bar */}
            <div className="flex flex-col items-center w-full">
              <div
                className="w-full bg-gradient-to-t from-[#00B3E3]/80 to-[#00B3E3]/20 rounded-t-sm"
                style={{ height: "40%" }}
              ></div>
              <p className="text-xs mt-2 text-gray-500">Basic</p>
              <p className="text-sm font-medium text-gray-900">$150-600</p>
            </div>

            {/* Pro Node Bar */}
            <div className="flex flex-col items-center w-full">
              <div
                className="w-full bg-gradient-to-t from-[#0077B6]/80 to-[#0077B6]/20 rounded-t-sm"
                style={{ height: "60%" }}
              ></div>
              <p className="text-xs mt-2 text-gray-500">Pro</p>
              <p className="text-sm font-medium text-gray-900">$450-1200</p>
            </div>

            {/* Enterprise Node Bar */}
            <div className="flex flex-col items-center w-full">
              <div
                className="w-full bg-gradient-to-t from-[#6B46C1]/80 to-[#6B46C1]/20 rounded-t-sm"
                style={{ height: "90%" }}
              ></div>
              <p className="text-xs mt-2 text-gray-500">Enterprise</p>
              <p className="text-sm font-medium text-gray-900">$900-3000</p>
            </div>
          </div>
        </div>

        {/* Chart legend */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00B3E3]"></div>
            <span className="text-xs text-gray-600">Basic Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0077B6]"></div>
            <span className="text-xs text-gray-600">Pro Node</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6B46C1]"></div>
            <span className="text-xs text-gray-600">Enterprise Node</span>
          </div>
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-4 bottom-4 top-4 flex flex-col justify-between items-start">
          <span className="text-xs text-gray-500">$3000</span>
          <span className="text-xs text-gray-500">$1500</span>
          <span className="text-xs text-gray-500">$0</span>
        </div>
      </div>

      <p className="text-sm text-gray-500 mt-4 text-center">
        *Estimated monthly earnings based on current market conditions. Results may vary.
      </p>
    </Card>
  )
}

