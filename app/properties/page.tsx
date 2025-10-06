import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

const placeholderProperties = [
  {
    id: "1",
    title: "Modern Prairie Estate",
    city: "Portland",
    state: "OR",
    listing_price: 1850000,
    price_per_night: 450,
    bedrooms: 4,
    bathrooms: 3.5,
    square_feet: 3850,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-1-QXUodg9LIDctpBkPeEUxGtiIqP0M1n.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "2",
    title: "Contemporary Luxury Villa",
    city: "Bellevue",
    state: "WA",
    listing_price: 2650000,
    price_per_night: 595,
    bedrooms: 5,
    bathrooms: 4.5,
    square_feet: 4800,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-2-Gz0YWMwN95WIAKsNwf2V0l3Gp1chDF.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "3",
    title: "Architectural Masterpiece",
    city: "Lake Oswego",
    state: "OR",
    listing_price: 3250000,
    price_per_night: 725,
    bedrooms: 5,
    bathrooms: 5,
    square_feet: 5400,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-3-xlH7fT2ARebLrlLfkq9AUTe5n4jQ1l.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "4",
    title: "Modern Sanctuary",
    city: "Vancouver",
    state: "WA",
    listing_price: 1950000,
    price_per_night: 475,
    bedrooms: 4,
    bathrooms: 3.5,
    square_feet: 3950,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-4-hPjJJH9OxGafs4qeIu1tmlZ3pziMnG.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "5",
    title: "Contemporary Ranch Estate",
    city: "Gresham",
    state: "OR",
    listing_price: 1295000,
    price_per_night: 350,
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 2850,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-5-DvksX8eDlwBrZ9dfeTWH4PcImcjMlf.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "6",
    title: "Modern Split-Level Retreat",
    city: "Redmond",
    state: "WA",
    listing_price: 1750000,
    price_per_night: 425,
    bedrooms: 4,
    bathrooms: 3,
    square_feet: 3600,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-6-k79xgR9gOHmgZ3fiD9P7sZYp1wMCYe.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "7",
    title: "Waterfront Estate",
    city: "Mercer Island",
    state: "WA",
    listing_price: 4250000,
    price_per_night: 895,
    bedrooms: 6,
    bathrooms: 5.5,
    square_feet: 7200,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-7-99BInxZ6uScOCOUbScUuoZNSITt4oA.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "8",
    title: "Lakefront Luxury Villa",
    city: "Washougal",
    state: "WA",
    listing_price: 2995000,
    price_per_night: 695,
    bedrooms: 5,
    bathrooms: 4.5,
    square_feet: 5800,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-8-Zkosmsq3f6LYbQ2fcdQNPrKPhDx7sP.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "9",
    title: "Waterfront Paradise",
    city: "Lake Stevens",
    state: "WA",
    listing_price: 3450000,
    price_per_night: 795,
    bedrooms: 6,
    bathrooms: 5,
    square_feet: 6200,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-9-koiA5fiGbRdcZxkyGtDFYXExsHbU8V.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
  {
    id: "10",
    title: "Contemporary Waterfront Estate",
    city: "Sammamish",
    state: "WA",
    listing_price: 3850000,
    price_per_night: 850,
    bedrooms: 6,
    bathrooms: 5.5,
    square_feet: 6800,
    images: [
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/sample-listing-10-SXnRoYF5I7rCjoDgIcVHR5RUQknZxY.jpg",
    ],
    is_active: true,
    verification_status: "approved",
  },
]

export default async function PropertiesPage() {
  const supabase = await createClient()

  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("is_active", true)
    .in("verification_status", ["approved", "pending"])
    .order("created_at", { ascending: false })

  const displayProperties = properties && properties.length > 0 ? properties : placeholderProperties

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Available Properties</h1>
            <p className="mt-2 text-slate-600">Browse homes you can try before buying</p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {displayProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
                <div className="aspect-[16/9] relative bg-gray-200 rounded-t-lg overflow-hidden">
                  {property.images && property.images.length > 0 ? (
                    <img
                      src={property.images[0] || "/placeholder.svg"}
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
                  <div className="flex items-center justify-between mt-2">
                    {property.listing_price && (
                      <p className="text-lg font-bold text-gray-900">${property.listing_price.toLocaleString()}</p>
                    )}
                    <Link href={`/properties/${property.id}`}>
                      <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                    {property.bedrooms && <span>{property.bedrooms} beds</span>}
                    {property.bedrooms && property.bathrooms && <span>•</span>}
                    {property.bathrooms && <span>{property.bathrooms} baths</span>}
                    {property.bathrooms && property.square_feet && <span>•</span>}
                    {property.square_feet && <span>{property.square_feet.toLocaleString()} sqft</span>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
