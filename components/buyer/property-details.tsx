"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, MapPin, DollarSign, ChevronLeft, ChevronRight } from "lucide-react"

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
  listing_price: number | null
  amenities: string[] | null
  images: string[] | null
  original_image_urls: string[] | null
  is_active: boolean
  verification_status: string
}

interface PropertyDetailsProps {
  property: Property
  userId?: string
}

export function PropertyDetails({ property, userId }: PropertyDetailsProps) {
  const router = useRouter()
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


  return (
    <div className="bg-slate-50 py-8">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="space-y-6">
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
                  <Button
                    size="lg"
                    onClick={() => {
                      if (!userId) {
                        router.push("/auth")
                        return
                      }
                      // TODO: Implement test drive request functionality
                      alert("Test drive request functionality coming soon!")
                    }}
                    disabled={!property.is_active || property.verification_status !== "approved"}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {userId ? "Request Test Drive" : "Sign in to Request"}
                  </Button>
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

                {property.verification_status !== "approved" && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800 text-center">
                      This property is pending verification
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
