import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { DollarSign } from "lucide-react"
import { formatPricingDisplay, getPricingTierInfo } from "@/lib/pricing"

export async function FeaturedProperties() {
  const supabase = await createClient()

  // Fetch the 3 most expensive single-family properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("is_active", true)
    .in("verification_status", ["approved", "pending"])
    .not("listing_price", "is", null)
    .eq("property_type", "Single Family")
    .order("listing_price", { ascending: false })
    .limit(3)

  // Fallback to placeholder properties if no data
  const displayProperties = properties && properties.length > 0 ? properties : [
    {
      id: "1",
      title: "Modern Prairie Estate",
      city: "Portland",
      state: "OR",
      listing_price: 1850000,
      bedrooms: 4,
      bathrooms: 3.5,
      square_feet: 3850,
      images: ["/sample-listing-11.jpg"],
      original_image_urls: null,
    },
    {
      id: "2",
      title: "Contemporary Forest Retreat",
      city: "Vancouver",
      state: "WA",
      listing_price: 1495000,
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 3200,
      images: ["/sample-listing-12.jpg"],
      original_image_urls: null,
    },
    {
      id: "3",
      title: "Waterfront Luxury Villa",
      city: "Washougal",
      state: "WA",
      listing_price: 2995000,
      bedrooms: 6,
      bathrooms: 5.5,
      square_feet: 6500,
      images: ["/sample-listing-13.jpg"],
      original_image_urls: null,
    },
  ]

  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Featured Properties</h2>
          <Link href="/properties" className="text-sm font-medium text-blue-600 hover:text-blue-700">
            View all
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {displayProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
              <div className="aspect-[16/9] relative bg-gray-200 rounded-t-lg overflow-hidden">
                {(property.images && property.images.length > 0) || (property.original_image_urls && property.original_image_urls.length > 0) ? (
                  <img
                    src={property.images?.[0] || property.original_image_urls?.[0] || "/placeholder.svg"}
                    alt={property.title}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-slate-400">No image</span>
                  </div>
                )}
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-base text-gray-900">{property.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {property.city}, {property.state}
                </p>
                {/* Property details in main title */}
                <div className="flex items-center gap-4 text-sm font-bold text-gray-700 mt-2">
                  {property.bedrooms && (
                    <span>{property.bedrooms} beds</span>
                  )}
                  {property.bathrooms && (
                    <span>{property.bathrooms} baths</span>
                  )}
                  {property.square_feet && (
                    <span>{property.square_feet.toLocaleString()} sqft</span>
                  )}
                </div>
                
                {/* Pricing Information */}
                <div className="mt-3 space-y-1">
                  {property.listing_price && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        Listed at ${property.listing_price.toLocaleString()}
                      </span>
                    </div>
                  )}
                  
                  {/* Nightly Rate */}
                  {(() => {
                    const effectivePricePerNight = property.pricing_override 
                      ? property.custom_price_per_night 
                      : property.calculated_price_per_night
                    
                    if (effectivePricePerNight) {
                      return (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-blue-600" />
                          <span className="text-lg font-bold text-blue-600">
                            Try for ${effectivePricePerNight.toLocaleString()}/night
                          </span>
                        </div>
                      )
                    } else if (property.pricing_tier === 'over_5m') {
                      return (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 italic">
                            Contact Seller for pricing
                          </span>
                        </div>
                      )
                    }
                    return null
                  })()}
                </div>
                
                <div className="flex items-center justify-end mt-3">
                  <Link href={`/properties/${property.id}`}>
                    <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
