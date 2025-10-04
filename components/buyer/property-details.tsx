"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Bed, Bath, Square, MapPin, DollarSign } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"

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
  is_active: boolean
  verification_status: string
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

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    return nights > 0 ? nights * property.price_per_night : 0
  }

  const handleBooking = async () => {
    if (!userId) {
      router.push("/auth")
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
      <div className="container max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
              {property.images && property.images.length > 0 ? (
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
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
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">${property.price_per_night}</span>
                  <span className="text-slate-600">/ night</span>
                </div>
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
                        ${property.price_per_night} x{" "}
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
