import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export async function FeaturedProperties() {
  const placeholderProperties = [
    {
      id: "1",
      title: "Modern Prairie Estate",
      location: "Portland, OR",
      listing_price: 1850000,
      bedrooms: 4,
      bathrooms: 3.5,
      square_feet: 3850,
      images: ["/sample-listing-11.jpg"],
    },
    {
      id: "2",
      title: "Contemporary Forest Retreat",
      location: "Vancouver, WA",
      listing_price: 1495000,
      bedrooms: 4,
      bathrooms: 3,
      square_feet: 3200,
      images: ["/sample-listing-12.jpg"],
    },
    {
      id: "3",
      title: "Waterfront Luxury Villa",
      location: "Washougal, WA",
      listing_price: 2995000,
      bedrooms: 6,
      bathrooms: 5.5,
      square_feet: 6500,
      images: ["/sample-listing-13.jpg"],
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
          {placeholderProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow">
              <div className="aspect-[16/9] relative bg-gray-200 rounded-t-lg overflow-hidden">
                <img
                  src={property.images[0] || "/placeholder.svg"}
                  alt={property.title}
                  className="object-cover w-full h-full"
                />
              </div>
              <CardContent className="p-3">
                <h3 className="font-semibold text-base text-gray-900">{property.title}</h3>
                <p className="text-sm text-gray-600 mt-0.5">{property.location}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-lg font-bold text-gray-900">${property.listing_price.toLocaleString()}</p>
                  <Link href={`/properties/${property.id}`}>
                    <Button className="rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-1.5 text-sm">
                      View Details
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-600">
                  <span>{property.bedrooms} beds</span>
                  <span>•</span>
                  <span>{property.bathrooms} baths</span>
                  <span>•</span>
                  <span>{property.square_feet.toLocaleString()} sqft</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
