"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bed, Bath, Square, Check, X } from "lucide-react"

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
  verification_status: string
  profiles: {
    full_name: string | null
    email: string
  }
}

export function PropertyVerification() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchProperties = async () => {
    const { data } = await supabase
      .from("properties")
      .select(
        `
        *,
        profiles (full_name, email)
      `,
      )
      .order("created_at", { ascending: false })

    setProperties(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const handleVerification = async (propertyId: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("properties").update({ verification_status: status }).eq("id", propertyId)

    if (!error) {
      fetchProperties()
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading properties...</div>
  }

  const pendingProperties = properties.filter((p) => p.verification_status === "pending")
  const approvedProperties = properties.filter((p) => p.verification_status === "approved")
  const rejectedProperties = properties.filter((p) => p.verification_status === "rejected")

  return (
    <div className="space-y-8">
      {pendingProperties.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Pending Verification</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingProperties.map((property) => (
              <Card key={property.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <p className="text-sm text-slate-600 mt-1">
                        {property.city}, {property.state}
                      </p>
                      <p className="text-sm text-slate-600">Seller: {property.profiles.email}</p>
                    </div>
                    <Badge variant="secondary">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden bg-slate-200">
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {approvedProperties.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Approved Properties</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {approvedProperties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
                    <Badge variant="default">Approved</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {property.city}, {property.state}
                  </p>
                  <p className="text-sm text-slate-600">{property.profiles.email}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {rejectedProperties.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Rejected Properties</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {rejectedProperties.map((property) => (
              <Card key={property.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{property.title}</h3>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    {property.city}, {property.state}
                  </p>
                  <p className="text-sm text-slate-600">{property.profiles.email}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
