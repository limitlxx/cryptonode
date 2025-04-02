"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronRight, Star, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Afircan M.",
    handle: "@afriquartz",
    // avatar: "/placeholder.svg?height=40&width=40",
    content: "Been running the Pro Node for 2 months on Solana. Already made back my investment! 🚀",
    rating: 5,
    date: "2 weeks ago",
    platform: "twitter",
  },
  {
    id: 2,
    name: "Olaveez",
    handle: "@vooduknows",
    // avatar: "/placeholder.svg?height=40&width=40",
    content: "Super easy setup. Making $25/day consistently with my Enterprise Node on Gnosis. Worth every penny!",
    rating: 5,
    date: "1 month ago",
    platform: "twitter",
  },
  {
    id: 3,
    name: "Mr Fianance",
    handle: "@mrfinance01",
    // avatar: "/placeholder.svg?height=40&width=40",
    content: "Started with the Basic Node on Solana, upgraded to Pro after seeing the results. Support team is 🔥",
    rating: 4,
    date: "3 weeks ago",
    platform: "twitter",
  },
]

export default function SocialProof() {
  const [activeIndex, setActiveIndex] = useState(0)

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[#00B3E3] to-[#6B46C1]">
          What People Are Saying
        </h2>
        <p className="text-center text-gray-600 mb-8 text-sm">Real users, real results</p>

        <div className="relative max-w-2xl mx-auto">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-300 ease-in-out"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
                  <Card className="bg-white border-gray-200 overflow-hidden shadow-sm">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        {/* <Image
                          src={testimonial.avatar || "/placeholder.svg"}
                          alt={testimonial.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        /> */}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900">{testimonial.name}</p>
                            {testimonial.platform === "twitter" && (
                              <Badge
                                variant="outline"
                                className="bg-[#1DA1F2]/10 text-[#1DA1F2] border-[#1DA1F2]/30 text-xs px-1.5 py-0"
                              >
                                <Twitter className="h-3 w-3 mr-0.5" />
                                <span className="text-xs">Twitter</span>
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs">{testimonial.handle}</p>
                        </div>
                        <div className="ml-auto text-xs text-gray-500">{testimonial.date}</div>
                      </div>

                      <p className="text-gray-700 mb-3 text-sm md:text-base">"{testimonial.content}"</p>

                      <div className="flex items-center">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < testimonial.rating ? "text-[#F59E0B] fill-[#F59E0B]" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center mt-4 gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8 border-gray-200 bg-white"
              onClick={prevTestimonial}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {testimonials.map((_, index) => (
              <Button
                key={index}
                variant="outline"
                size="icon"
                className={`rounded-full h-2 w-2 p-0 ${
                  index === activeIndex ? "bg-[#00B3E3] border-[#00B3E3]" : "bg-gray-200 border-gray-200"
                }`}
                onClick={() => setActiveIndex(index)}
              />
            ))}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-8 w-8 border-gray-200 bg-white"
              onClick={nextTestimonial}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

