"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { MapPin, Home, DollarSign, MessageSquare, AlertCircle } from "lucide-react"
import { toast } from "sonner"

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

interface PropertyListingRequestModalProps {
  property: Property | null
  userId: string
  userRole: "seller" | "seller_agent"
  onClose: () => void
  onSuccess: () => void
}

export function PropertyListingRequestModal({ 
  property, 
  userId, 
  userRole, 
  onClose, 
  onSuccess 
}: PropertyListingRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [newPropertyAddress, setNewPropertyAddress] = useState("")
  const [newPropertyCity, setNewPropertyCity] = useState("")
  const [newPropertyState, setNewPropertyState] = useState("")
  const [newPropertyZip, setNewPropertyZip] = useState("")
  const [newPropertyNotes, setNewPropertyNotes] = useState("")

  const supabase = createClient()

  const handleSubmitRequest = async () => {
    if (userRole === "seller_agent") {
      // Agent can directly add the property
      await handleAgentAddProperty()
    } else {
      // Seller needs to send request to agent
      await handleSellerRequest()
    }
  }

  const handleSellerRequest = async () => {
    setLoading(true)
    try {
      // Get seller's agent info
      const { data: sellerProfile } = await supabase
        .from("seller_profiles")
        .select("agent_email, agent_name")
        .eq("id", userId)
        .single()

      if (!sellerProfile?.agent_email) {
        toast.error("No agent assigned. Please contact support.")
        return
      }

      const requestData = {
        seller_id: userId,
        agent_email: sellerProfile.agent_email,
        property_id: property?.id || null,
        request_type: property ? "existing_property" : "new_property",
        property_address: property ? property.address : newPropertyAddress,
        property_city: property ? property.city : newPropertyCity,
        property_state: property ? property.state : newPropertyState,
        property_zip: property ? property.zip_code : newPropertyZip,
        message: message || newPropertyNotes,
        status: "listing_requested"
      }

      console.log("Sending request with data:", requestData)

      const response = await fetch('/api/property-listing-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send request')
      }

      const result = await response.json()
      console.log("Request sent successfully:", result)
      toast.success("Request sent to your agent successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error sending request:", error)
      toast.error(`Failed to send request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAgentAddProperty = async () => {
    setLoading(true)
    try {
      if (!property) {
        toast.error("No property selected")
        return
      }

      // Agent can directly add the property
      const { error } = await supabase
        .from("properties")
        .update({
          seller_id: userId,
          is_active: false, // Wait for seller approval
          agent_created: true,
          created_by_agent: true
        })
        .eq("id", property.id)

      if (error) {
        throw error
      }

      toast.success("Property added to your listings (pending seller approval)")
      onSuccess()
    } catch (error) {
      console.error("Error adding property:", error)
      toast.error("Failed to add property. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const isNewProperty = !property

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {userRole === "seller_agent" 
              ? "Add Property to Listings" 
              : "Request Property Listing"
            }
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          {property ? (
            <div className="bg-slate-50 p-4 rounded-lg">
              <h3 className="font-semibold text-slate-900 mb-2">{property.title}</h3>
              <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
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
              <Badge variant="outline" className="mt-2">
                {property.seller_id ? "Already Listed" : "Available"}
              </Badge>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">New Property Request</h3>
              </div>
              <p className="text-sm text-blue-700">
                This property is not currently in our database. Please provide the property details below.
              </p>
            </div>
          )}

          {/* New Property Form */}
          {isNewProperty && (
            <div className="space-y-4">
              <h4 className="font-semibold text-slate-900">Property Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={newPropertyAddress}
                    onChange={(e) => setNewPropertyAddress(e.target.value)}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newPropertyCity}
                    onChange={(e) => setNewPropertyCity(e.target.value)}
                    placeholder="Seattle"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={newPropertyState}
                    onChange={(e) => setNewPropertyState(e.target.value)}
                    placeholder="WA"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={newPropertyZip}
                    onChange={(e) => setNewPropertyZip(e.target.value)}
                    placeholder="98101"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Message/Notes */}
          <div className="space-y-2">
            <Label htmlFor="message">
              {userRole === "seller_agent" ? "Notes" : "Message to Agent"}
            </Label>
            <Textarea
              id="message"
              value={isNewProperty ? newPropertyNotes : message}
              onChange={(e) => isNewProperty ? setNewPropertyNotes(e.target.value) : setMessage(e.target.value)}
              placeholder={
                userRole === "seller_agent" 
                  ? "Add any notes about this property..."
                  : "Tell your agent why you'd like to list this property..."
              }
              rows={3}
            />
          </div>

          {/* Agent Info for Sellers */}
          {userRole === "seller" && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Request Process</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    Your request will be sent to your assigned agent. They will review your request 
                    and either add the property to your listings or contact you for more information.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={loading || (isNewProperty && (!newPropertyAddress || !newPropertyCity || !newPropertyState || !newPropertyZip))}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Processing..." : userRole === "seller_agent" ? "Add to Listings" : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
