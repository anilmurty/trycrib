"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Bed, Bath, Square, Check, X, Search, ChevronLeft, ChevronRight } from "lucide-react"

interface Property {
  id: string
  title: string
  city: string
  state: string
  address: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  price_per_night: number
  listing_price: number | null
  images: string[] | null
  original_image_urls: string[] | null
  verification_status: string
  profiles: {
    full_name: string | null
    email: string
  }
}

const ITEMS_PER_PAGE = 6

export function PropertyVerificationPaginated() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [sortBy, setSortBy] = useState<"created_at" | "title" | "listing_price">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  
  const supabase = createClient()

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      let query = supabase
        .from("properties")
        .select(
          `
          *,
          profiles (full_name, email)
        `,
          { count: "exact" }
        )

      // Apply status filter
      if (statusFilter !== "all") {
        query = query.eq("verification_status", statusFilter)
      }

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
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [currentPage, searchTerm, statusFilter, sortBy, sortOrder])

  const handleVerification = async (propertyId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("properties").update({ verification_status: status }).eq("id", propertyId)

    if (!error) {
      fetchProperties()
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    fetchProperties()
  }

  const handleSort = (field: "created_at" | "title" | "listing_price") => {
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
        <div className="flex flex-col lg:flex-row gap-4">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search properties..."
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
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            
            <Button
              variant={sortBy === "created_at" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("created_at")}
            >
              Date {sortBy === "created_at" && (sortOrder === "desc" ? "↓" : "↑")}
            </Button>
            <Button
              variant={sortBy === "title" ? "default" : "outline"}
              size="sm"
              onClick={() => handleSort("title")}
            >
              Title {sortBy === "title" && (sortOrder === "desc" ? "↓" : "↑")}
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
          {searchTerm && (
            <p className="text-gray-400 mt-2">Try adjusting your search terms</p>
          )}
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            {properties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {property.city}, {property.state}
                      </p>
                      <p className="text-sm text-slate-600">Seller: {property.profiles?.email || 'No seller assigned'}</p>
                    </div>
                    {getStatusBadge(property.verification_status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
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

                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="h-4 w-4" />
                        <span>{property.bedrooms}</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="h-4 w-4" />
                        <span>{property.bathrooms}</span>
                      </div>
                    )}
                    {property.square_feet && (
                      <div className="flex items-center gap-1">
                        <Square className="h-4 w-4" />
                        <span>{property.square_feet.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {property.listing_price && (
                    <div className="text-lg font-semibold text-slate-900">
                      ${property.listing_price.toLocaleString()}
                    </div>
                  )}

                  {property.verification_status === "pending" && (
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm" onClick={() => handleVerification(property.id, "approved")}>
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                        onClick={() => handleVerification(property.id, "rejected")}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  )}
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
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, properties.length)} of {properties.length} properties
          </div>
        </>
      )}
    </div>
  )
}
