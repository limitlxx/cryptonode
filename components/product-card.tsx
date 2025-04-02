"use client"

import { useState } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ShoppingCart, Sparkles } from "lucide-react"

interface Product {
  id: number
  name: string
  type: string
  specs: string[]
  price: number
  originalPrice: number
  dailyEarnings: string
  // image: string
  featured?: boolean
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Card
      className={`bg-white border-gray-200 overflow-hidden transition-all duration-300 h-full shadow-sm ${
        product.featured ? "ring-2 ring-[#00B3E3]/50 scale-105 md:scale-105 shadow-md" : ""
      } ${isHovered ? "transform translate-y-[-8px] shadow-lg shadow-[#00B3E3]/10" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {product.featured && (
        <div className="bg-gradient-to-r from-[#00B3E3] to-[#0077B6] text-white text-center py-1 text-xs font-medium flex items-center justify-center">
          <Sparkles className="h-3 w-3 mr-1" /> MOST POPULAR
        </div>
      )}

      <div className="relative h-10 w-full">
        {/* <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" /> */}
        <div className="absolute top-2 right-2">
          <Badge variant="outline" className="bg-[#10B981]/20 text-[#10B981] border-[#10B981]/30">
            {product.dailyEarnings}/day
          </Badge>
        </div>
      </div>

      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-gray-900">{product.name}</CardTitle>
            <CardDescription className="text-gray-500 text-xs">{product.type}</CardDescription>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1.5 bg-[#F59E0B]/10 p-1.5 rounded-md">
          <div className="w-6 h-6 rounded-full bg-[#F59E0B]/20 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
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
          <span className="text-xs font-medium text-[#F59E0B]">FREE Oraimo 50,000mAh Power Bank</span>
        </div>
      </CardHeader>

      <CardContent className="pb-2">
        <ul className="space-y-1">
          {product.specs.map((spec, index) => (
            <li key={index} className="flex items-start gap-1.5">
              <Check className="h-4 w-4 text-[#10B981] shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{spec}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center justify-between w-full">
          <div>
            <p className="text-xl font-bold text-gray-900">${product.price}</p>
            <p className="text-xs text-gray-500 line-through">${product.originalPrice}</p>
          </div>
          <Badge variant="outline" className="bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/30 text-xs">
            Save ${product.originalPrice - product.price}
          </Badge>
        </div>

        <Button className="w-full bg-gradient-to-r from-[#00B3E3] to-[#0077B6] hover:from-[#00B3E3] hover:to-[#005F8F] text-white border-0 rounded-full text-sm">
          <ShoppingCart className="mr-1.5 h-4 w-4" /> Order Now
        </Button>
      </CardFooter>
    </Card>
  )
}

