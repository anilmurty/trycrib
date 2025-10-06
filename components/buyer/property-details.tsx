"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Bed, Bath, Square, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { formatPricingDisplay, getPricingTierInfo } from "@/lib/pricing"

interface Property {
  id: string
  title: string
  description: string | null
  address: string
  city: string
  state: string
  zip_code: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  price_per_night: number
  listing_price: number | null
  amenities: string[] | null
  images: string[] | null
  original_image_urls: string[] | null
  is_active: boolean
  verification_status: string
  // Pricing system fields
  pricing_tier?: 'under_500k' | '500k_1m' | '1m_1_5m' | '1_5m_3m' | '3m_5m' | 'over_5m' | null
  calculated_price_per_night?: number | null
  pricing_override?: boolean
  custom_price_per_night?: number | null
}

interface PropertyDetailsProps {
  property: Property
  userId?: string
}

export function PropertyDetails({ property, userId }: PropertyDetailsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Get available images (prioritize images over original_image_urls)
  const availableImages = property.images && property.images.length > 0 
    ? property.images 
    : property.original_image_urls || []

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % availableImages.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + availableImages.length) % availableImages.length)
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    
    // Use effective price per night (calculated or custom)
    const effectivePricePerNight = property.pricing_override 
      ? property.custom_price_per_night 
      : property.calculated_price_per_night || property.price_per_night
    
    return nights > 0 && effectivePricePerNight ? nights * effectivePricePerNight : 0
  }

  const handleBooking = async () => {
    if (!userId) {
      router.push("/sign-in")
      return
    }

    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates")
      return
    }

    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

    if (nights <= 0) {
      setError("Check-out must be after check-in")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Create checkout session
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          propertyId: property.id,
          checkIn,
          checkOut,
          totalPrice: calculateTotal(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      if (stripe && data.sessionId) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId })
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const totalPrice = calculateTotal()

  return (
    <div className="bg-slate-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Carousel */}
            <div className="relative aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
              {availableImages.length > 0 ? (
                <>
                  <img
                    src={availableImages[currentImageIndex]}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                  
                  {/* Navigation arrows */}
                  {availableImages.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  
                  {/* Image indicators */}
                  {availableImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {availableImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-slate-400">No image available</span>
                </div>
              )}
            </div>

            {/* Property Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl">{property.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2 text-slate-600">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </span>
                    </div>
                  </div>
                  <Badge variant={property.is_active ? "default" : "secondary"}>
                    {property.is_active ? "Available" : "Unavailable"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  {property.bedrooms && (
                    <div className="flex items-center gap-2">
                      <Bed className="h-5 w-5 text-slate-600" />
                      <span className="text-slate-900">{property.bedrooms} Bedrooms</span>
                    </div>
                  )}
                  {property.bathrooms && (
                    <div className="flex items-center gap-2">
                      <Bath className="h-5 w-5 text-slate-600" />
                      <span className="text-slate-900">{property.bathrooms} Bathrooms</span>
                    </div>
                  )}
                  {property.square_feet && (
                    <div className="flex items-center gap-2">
                      <Square className="h-5 w-5 text-slate-600" />
                      <span className="text-slate-900">{property.square_feet.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>

                {property.listing_price && (
                  <div className="flex items-center gap-2 text-lg">
                    <DollarSign className="h-5 w-5 text-slate-600" />
                    <span className="font-semibold text-slate-900">
                      Listed at ${property.listing_price.toLocaleString()}
                    </span>
                  </div>
                )}

                {property.description && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-2">About this property</h3>
                    <p className="text-slate-600 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {property.amenities && property.amenities.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">Amenities</h3>
                    <div className="flex flex-wrap gap-2">
                      {property.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Book Your Stay</CardTitle>
                {(() => {
                  const effectivePricePerNight = property.pricing_override 
                    ? property.custom_price_per_night 
                    : property.calculated_price_per_night || property.price_per_night
                  
                  if (effectivePricePerNight) {
                    return (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">${effectivePricePerNight.toLocaleString()}</span>
                        <span className="text-slate-600">/ night</span>
                      </div>
                    )
                  } else if (property.pricing_tier === 'over_5m') {
                    return (
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-slate-600">Contact Seller for Pricing</span>
                      </div>
                    )
                  } else {
                    return (
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-slate-900">${property.price_per_night.toLocaleString()}</span>
                        <span className="text-slate-600">/ night</span>
                      </div>
                    )
                  }
                })()}
                
                {/* Pricing Tier Badge */}
                {property.pricing_tier && (
                  <div className="mt-2">
                    {(() => {
                      const tierInfo = getPricingTierInfo(property.pricing_tier)
                      if (!tierInfo) return null
                      
                      const colorClasses = {
                        green: 'bg-green-100 text-green-800',
                        blue: 'bg-blue-100 text-blue-800',
                        purple: 'bg-purple-100 text-purple-800',
                        orange: 'bg-orange-100 text-orange-800',
                        red: 'bg-red-100 text-red-800',
                        gray: 'bg-gray-100 text-gray-800'
                      }
                      
                      return (
                        <Badge className={`text-xs ${colorClasses[tierInfo.color] || 'bg-gray-100 text-gray-800'}`}>
                          {tierInfo.name}
                        </Badge>
                      )
                    })()}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="check-in">Check-in</Label>
                  <Input
                    id="check-in"
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="check-out">Check-out</Label>
                  <Input
                    id="check-out"
                    type="date"
                    min={checkIn || new Date().toISOString().split("T")[0]}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>

                {totalPrice > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-600">
                        ${(() => {
                          const effectivePricePerNight = property.pricing_override 
                            ? property.custom_price_per_night 
                            : property.calculated_price_per_night || property.price_per_night
                          return effectivePricePerNight?.toLocaleString() || '0'
                        })()} x{" "}
                        {Math.ceil(
                          (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24),
                        )}{" "}
                        nights
                      </span>
                      <span className="font-semibold text-slate-900">${totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${totalPrice.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleBooking}
                  disabled={isLoading || !property.is_active || property.verification_status !== "approved"}
                >
                  {isLoading ? "Booking..." : userId ? "Reserve" : "Sign in to Book"}
                </Button>

                {property.verification_status !== "approved" && (
                  <p className="text-xs text-center text-slate-500">This property is pending verification</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
