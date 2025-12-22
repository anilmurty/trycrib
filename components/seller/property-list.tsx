"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Bed, Bath, Square, Edit, Eye, AlertCircle } from "lucide-react"
import Link from "next/link"
import { PropertyListingRequestModal } from "@/components/property-listing-request-modal"

interface Property {
  id: string
  title: string
  city: string
  state: string
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  price_per_night: number
  listing_price: number | null
  images: string[] | null
  is_active: boolean
  verification_status: string
}

export function PropertyList({ userId }: { userId: string }) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAgent, setHasAgent] = useState<boolean | null>(null)
  const [showNoAgentDialog, setShowNoAgentDialog] = useState(false)
  const [showRequestModal, setShowRequestModal] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      // Fetch properties
      const { data: propertiesData } = await supabase
        .from("properties")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })

      setProperties(propertiesData || [])

      // Check if seller has an agent
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("agent_email")
        .eq("id", userId)
        .single()

      setHasAgent(!!sellerProfile?.agent_email)
      setLoading(false)
    }

    fetchData()
  }, [userId, supabase])

  const handleAddPropertyClick = () => {
    // Wait for agent check to complete
    if (hasAgent === null) {
      return
    }
    
    if (hasAgent) {
      setShowRequestModal(true)
    } else {
      setShowNoAgentDialog(true)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading properties...</div>
  }

  if (properties.length === 0) {
    return (
      <>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-600 mb-4">You haven't listed any properties yet</p>
            <Button 
              onClick={handleAddPropertyClick} 
              className="cursor-pointer"
              disabled={hasAgent === null}
            >
              Add Your First Property
            </Button>
          </CardContent>
        </Card>

        <Dialog open={showNoAgentDialog} onOpenChange={setShowNoAgentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-500" />
                Agent Required
              </DialogTitle>
              <DialogDescription>
                You need to add an agent to your profile before you can request to list a property.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNoAgentDialog(false)}>
                Cancel
              </Button>
              <Link href="/settings" className="cursor-pointer">
                <Button onClick={() => setShowNoAgentDialog(false)}>
                  Go to Settings
                </Button>
              </Link>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {showRequestModal && (
          <PropertyListingRequestModal
            property={null}
            userId={userId}
            userRole="seller"
            onClose={() => setShowRequestModal(false)}
            onSuccess={() => {
              setShowRequestModal(false)
              // Refresh properties list
              supabase
                .from("properties")
                .select("*")
                .eq("seller_id", userId)
                .order("created_at", { ascending: false })
                .then(({ data }) => {
                  setProperties(data || [])
                })
            }}
          />
        )}
      </>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <Card key={property.id} className="overflow-hidden">
          <div className="aspect-[4/3] relative bg-slate-200">
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
            <div className="absolute top-3 right-3 flex gap-2">
              <Badge variant={property.is_active ? "default" : "secondary"}>
                {property.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge
                variant={
                  property.verification_status === "approved"
                    ? "default"
                    : property.verification_status === "pending"
                      ? "secondary"
                      : "destructive"
                }
              >
                {property.verification_status}
              </Badge>
            </div>
          </div>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg text-slate-900 line-clamp-1">{property.title}</h3>
            <p className="text-sm text-slate-600 mt-1">
              {property.city}, {property.state}
            </p>
            <p className="text-sm font-medium text-slate-900 mt-2">${property.price_per_night}/night</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
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
            <div className="flex gap-2 mt-4">
              <Link href={`/properties/${property.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
              </Link>
              <Link href={`/dashboard/seller/properties/${property.id}/edit`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
