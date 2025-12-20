"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Home, Building2, Building, Users, Warehouse, Factory } from "lucide-react"
import Link from "next/link"

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"buyers" | "sellers">("buyers")
  const [backgroundSlide, setBackgroundSlide] = useState(0)

  const buyerBackgroundImages = ["/buyer-carousel-1.jpg", "/buyer-carousel-2.jpg", "/buyer-carousel-4.jpg"]

  const sellerBackgroundImages = ["/seller-carousel-1.jpg", "/seller-carousel-2.jpg", "/seller-carousel-3.jpg"]

  const backgroundImages = activeTab === "buyers" ? buyerBackgroundImages : sellerBackgroundImages

  useEffect(() => {
    setBackgroundSlide(0)
  }, [activeTab])

  useEffect(() => {
    const timer = setInterval(() => {
      setBackgroundSlide((prev) => (prev + 1) % backgroundImages.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [backgroundImages.length])

  return (
    <section className="relative bg-gray-900">
      <div className="absolute inset-0">
        {backgroundImages.map((image, index) => (
          <div
            key={image}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === backgroundSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={image || "/placeholder.svg"} alt="Hero background" className="h-full w-full object-cover" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/20 to-gray-900/40" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="text-center">
          {activeTab === "buyers" ? (
            <>
              <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                Try Your Future Home
                <br />
                Before You Buy
              </h1>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
                List Your Property for
                <br />
                Try-Before-You-Buy
              </h1>
            </>
          )}

          {/* Tabs */}
          <div className="mt-8 flex justify-center gap-4">
            <Button
              onClick={() => setActiveTab("buyers")}
              className={`rounded-full px-8 ${
                activeTab === "buyers"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              For Buyers
            </Button>
            <Button
              onClick={() => setActiveTab("sellers")}
              className={`rounded-full px-8 ${
                activeTab === "sellers"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-white text-gray-900 hover:bg-gray-100"
              }`}
            >
              For Sellers
            </Button>
          </div>

          {activeTab === "buyers" ? (
            <>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200">
                Experience living in your potential new home before making an offer.
                <br />
                The perfect way to ensure it's the right fit for you.
              </p>
              <div className="mt-6">
                <Link href="/properties" className="cursor-pointer">
                  <Button className="rounded-full px-8 bg-blue-600 text-white hover:bg-blue-700">
                    Book a stay
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-200">
                Let potential buyers experience your property firsthand.
                <br />
                Increase serious offers and reduce time-wasting viewings.
              </p>
              <div className="mt-6">
                <Link href="/sign-up" className="cursor-pointer">
                  <Button className="rounded-full px-8 bg-blue-600 text-white hover:bg-blue-700">
                    List your Home
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Property Types */}
      <div className="relative border-t border-gray-200 bg-gray-50 py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 gap-6 md:grid-cols-6">
            <Link
              href="/properties?type=house"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Home className="h-5 w-5" />
              <span className="text-xs">Houses</span>
            </Link>
            <Link
              href="/properties?type=townhouse"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Building2 className="h-5 w-5" />
              <span className="text-xs">Townhomes</span>
            </Link>
            <Link
              href="/properties?type=multi-family"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Building className="h-5 w-5" />
              <span className="text-xs">Multi-family</span>
            </Link>
            <Link
              href="/properties?type=condo"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Warehouse className="h-5 w-5" />
              <span className="text-xs">Condos/Co-ops</span>
            </Link>
            <Link
              href="/properties?type=apartment"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Users className="h-5 w-5" />
              <span className="text-xs">Apartments</span>
            </Link>
            <Link
              href="/properties?type=manufactured"
              className="flex flex-col items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              <Factory className="h-5 w-5" />
              <span className="text-xs">Manufactured</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
