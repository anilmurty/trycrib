"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useUser } from "@clerk/nextjs"
import { ChevronLeft, ChevronRight, Search, Filter, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"

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
  images: string[] | null
  original_image_urls: string[] | null
  is_active: boolean
  verification_status: string
  created_at: string
  // Pricing system fields
  pricing_tier?: 'under_500k' | '500k_1m' | '1m_1_5m' | '1_5m_3m' | '3m_5m' | 'over_5m' | null
  calculated_price_per_night?: number | null
  pricing_override?: boolean
  custom_price_per_night?: number | null
}

const ITEMS_PER_PAGE = 12

export function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "listing_price" | "price_per_night">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const { isSignedIn } = useUser()
  const supabase = createClient()

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from("properties")
        .select(`
          id,
          title,
          description,
          address,
          city,
          state,
          zip_code,
          bedrooms,
          bathrooms,
          square_feet,
          price_per_night,
          listing_price,
          images,
          original_image_urls,
          is_active,
          verification_status,
          created_at,
          pricing_tier,
          calculated_price_per_night,
          pricing_override,
          custom_price_per_night
        `, { count: "exact" })
        .eq("is_active", true)
        .in("verification_status", ["approved", "pending"])

      // Apply search filter - only use appliedSearchTerm, not searchTerm
      if (appliedSearchTerm) {
        query = query.or(`title.ilike.%${appliedSearchTerm}%,address.ilike.%${appliedSearchTerm}%,city.ilike.%${appliedSearchTerm}%,state.ilike.%${appliedSearchTerm}%`)
      }

      // Apply sorting
      query = query.order(sortBy, { ascending: sortOrder === "asc" })

      // Apply pagination
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error("Error fetching properties:", error)
        return
      }

      setProperties(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [currentPage, appliedSearchTerm, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setAppliedSearchTerm(searchTerm.trim())
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleSort = (field: "created_at" | "listing_price" | "price_per_night") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
    setCurrentPage(1)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Bar */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex flex-col sm:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search by title, address, city, or state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
          
          <div className="flex gap-2">
            <Button
              variant={sortBy === "created_at" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("created_at")}
            >
              Newest {sortBy === "created_at" && (sortOrder === "desc" ? "↓" : "↑")}
            </Button>
            <Button
              variant={sortBy === "listing_price" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("listing_price")}
            >
              Price {sortBy === "listing_price" && (sortOrder === "desc" ? "↓" : "↑")}
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found</p>
          {appliedSearchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
              <Link key={property.id} href={isSignedIn ? `/properties/${property.id}` : `/auth?tab=login&redirect=/properties/${property.id}`} className="cursor-pointer">
                <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow cursor-pointer">
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
                  <CardContent className="p-3 pb-2">
                    {/* Property details in main title */}
                    <div className="flex items-center gap-4 text-sm font-bold text-gray-700">
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
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {property.city}, {property.state}
                    </p>
                    {property.address && (
                      <p className="text-sm text-gray-600 mt-0.5">
                        {property.address}
                      </p>
                    )}
                    
                    {/* Property Info */}
                    {property.listing_price && (
                      <div className="mt-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Listed at ${property.listing_price.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-8">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Results Info */}
          <div className="text-center text-sm text-gray-500">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} properties
          </div>
        </>
      )}
    </div>
  )
}
