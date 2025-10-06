"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { ChevronLeft, ChevronRight, Search, Filter } from "lucide-react"
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
}

const ITEMS_PER_PAGE = 12

export function PropertiesList() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<"created_at" | "listing_price" | "price_per_night">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const supabase = createClient()

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from("properties")
        .select("*", { count: "exact" })
        .eq("is_active", true)
        .in("verification_status", ["approved", "pending"])

      // Apply search filter
      if (searchTerm) {
        query = query.or(`title.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%,city.ilike.%${searchTerm}%,state.ilike.%${searchTerm}%`)
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
  }, [currentPage, searchTerm, sortBy, sortOrder])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1) // Reset to first page when searching
    fetchProperties()
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
            <Button
              variant={sortBy === "price_per_night" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("price_per_night")}
            >
              Nightly {sortBy === "price_per_night" && (sortOrder === "desc" ? "↓" : "↑")}
            </Button>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No properties found</p>
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => (
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
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
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
                </CardContent>
              </Card>
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
