"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Home, DollarSign, Plus } from "lucide-react"
import { PropertyListingRequestModal } from "./property-listing-request-modal"

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip_code: string
  listing_price: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  images: string[] | null
  is_active: boolean
  seller_id: string | null
}

interface PropertySearchProps {
  userRole: "seller" | "seller_agent"
  userId: string
  onPropertySelected?: (property: Property) => void
}

export function PropertySearch({ userRole, userId, onPropertySelected }: PropertySearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const supabase = createClient()

  const searchProperties = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    try {
      // Use a simpler approach - search in address field only
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .ilike("address", `%${query}%`)
        .eq("is_active", true)
        .limit(10)

      if (error) {
        console.error("Error searching properties:", error)
        return
      }

      setSearchResults(data || [])

    } catch (error) {
      console.error("Error searching properties:", error)
      setSearchResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchProperties(searchQuery)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery])

  const handlePropertySelect = (property: Property) => {
    if (onPropertySelected) {
      onPropertySelected(property)
    } else if (userRole === "seller") {
      setSelectedProperty(property)
      setShowRequestModal(true)
    }
  }

  const handleRequestNewProperty = () => {
    setSelectedProperty(null)
    setShowRequestModal(true)
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Properties
          </CardTitle>
          <p className="text-sm text-slate-600">
            {userRole === "seller" 
              ? "Search for properties you'd like to list on TryCrib"
              : "Search for properties to add to your listings"
            }
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by address, city, state, or ZIP code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              {userRole === "seller" && (
                <Button 
                  onClick={handleRequestNewProperty}
                  variant="outline"
                  className="whitespace-nowrap"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Request New Property
                </Button>
              )}
            </div>

            {loading && (
              <div className="text-center py-4 text-slate-600">
                Searching properties...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-slate-900">
                  Found {searchResults.length} properties
                </h3>
                {searchResults.map((property) => (
                  <div
                    key={property.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 cursor-pointer"
                    onClick={() => handlePropertySelect(property)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-slate-900">{property.title}</h4>
                        <Badge variant={property.seller_id ? "secondary" : "default"}>
                          {property.seller_id ? "Already Listed" : "Available"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-600 mb-1">
                        <MapPin className="h-4 w-4" />
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-slate-600">
                        {property.bedrooms && property.bathrooms && (
                          <div className="flex items-center gap-1">
                            <Home className="h-4 w-4" />
                            {property.bedrooms} bed • {property.bathrooms} bath
                            {property.square_feet && ` • ${property.square_feet.toLocaleString()} sqft`}
                          </div>
                        )}
                        {property.listing_price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            ${property.listing_price.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      {userRole === "seller" ? (
                        <Button 
                          size="sm"
                          variant={property.seller_id ? "outline" : "default"}
                          disabled={property.seller_id === userId}
                        >
                          {property.seller_id === userId 
                            ? "Your Property" 
                            : property.seller_id 
                              ? "Request to List" 
                              : "Request to List"
                          }
                        </Button>
                      ) : (
                        <Button 
                          size="sm"
                          variant="default"
                          disabled={property.seller_id === userId}
                        >
                          {property.seller_id === userId ? "Your Listing" : "Add to Listings"}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && !loading && searchResults.length === 0 && (
              <div className="text-center py-8 text-slate-600">
                <Search className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <p>No properties found matching "{searchQuery}"</p>
                {userRole === "seller" && (
                  <p className="text-sm text-slate-500 mt-2">
                    Try searching with different terms or request to add a new property
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {showRequestModal && (
        <PropertyListingRequestModal
          property={selectedProperty}
          userId={userId}
          userRole={userRole}
          onClose={() => {
            setShowRequestModal(false)
            setSelectedProperty(null)
          }}
          onSuccess={() => {
            setShowRequestModal(false)
            setSelectedProperty(null)
            // Refresh search results
            searchProperties(searchQuery)
          }}
        />
      )}
    </div>
  )
}
