"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Home, MapPin, DollarSign, Bed, Bath, Square } from "lucide-react"
import { Property } from "@/lib/types"

interface PropertyClaimingProps {
  userId: string
}

export function PropertyClaiming({ userId }: PropertyClaimingProps) {
  const [searchAddress, setSearchAddress] = useState("")
  const [searchResults, setSearchResults] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [claiming, setClaiming] = useState<string | null>(null)
  const [claimReason, setClaimReason] = useState("")
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [existingClaims, setExistingClaims] = useState<Record<string, any>>({})
  
  const supabase = createClient()

  const searchProperties = async () => {
    if (!searchAddress.trim()) return
    
    setLoading(true)
    setMessage(null)
    
    try {
      const { data, error } = await supabase.rpc('get_properties_by_address', {
        search_address: searchAddress
      })
      
      if (error) throw error
      
      setSearchResults(data || [])
      
      // Fetch existing claims for the found properties
      if (data && data.length > 0) {
        const propertyIds = data.map(p => p.id)
        console.log("Fetching claims for property IDs:", propertyIds)
        
        const { data: claims, error: claimsError } = await supabase
          .from("property_claims")
          .select("property_id, claim_status, claimant_id")
          .in("property_id", propertyIds)
          .eq("claimant_id", userId)
        
        console.log("Claims fetch result:", { claims, claimsError })
        
        // Create a map of property_id to claim info
        const claimsMap: Record<string, any> = {}
        claims?.forEach(claim => {
          claimsMap[claim.property_id] = claim
        })
        console.log("Claims map:", claimsMap)
        setExistingClaims(claimsMap)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to search properties' })
    } finally {
      setLoading(false)
    }
  }

  const claimProperty = async (propertyId: string) => {
    setClaiming(propertyId)
    setMessage(null)
    
    try {
      // First check if the property can be claimed
      const checkResponse = await fetch(`/api/properties/check?propertyId=${propertyId}`)
      const checkResult = await checkResponse.json()

      if (!checkResult.can_claim) {
        if (checkResult.property?.seller_id) {
          setMessage({ type: 'error', text: 'This property is already owned by another seller.' })
        } else if (checkResult.existing_claims?.length > 0) {
          setMessage({ type: 'error', text: 'This property already has a pending claim.' })
        } else if (!checkResult.property?.is_seed_property) {
          setMessage({ type: 'error', text: 'This property is not available for claiming.' })
        } else {
          setMessage({ type: 'error', text: 'This property cannot be claimed at this time.' })
        }
        return
      }

      // If property can be claimed, submit the claim
      const response = await fetch('/api/properties/claim', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          claimReason
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: result.message || 'Property claim submitted successfully! An admin will review your claim and you\'ll receive an email notification when approved. The property will then appear in your dashboard.' 
        })
        setClaimReason("")
        // Refresh search results
        searchProperties()
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to submit claim' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to submit claim' })
    } finally {
      setClaiming(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Claim Your Property</h2>
        <p className="text-slate-600 mt-2">
          Search for properties you own and claim them to start managing them on TryCrib.
        </p>
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How Property Claiming Works:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Search for properties by entering the address</li>
            <li>• Submit a claim with your reason for ownership</li>
            <li>• An admin will review and approve your claim</li>
            <li>• You'll receive an email notification when approved</li>
            <li>• Once approved, the property will appear in your dashboard</li>
          </ul>
        </div>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Properties
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="address">Property Address</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="address"
                placeholder="Enter property address (e.g., 1234 Oak Street)"
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchProperties()}
              />
              <Button onClick={searchProperties} disabled={loading || !searchAddress.trim()}>
                {loading ? 'Searching...' : 'Search'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">
            Found {searchResults.length} propert{searchResults.length === 1 ? 'y' : 'ies'}
          </h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            {searchResults.map((property) => (
              <Card key={property.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{property.title}</CardTitle>
                      <div className="flex items-center gap-1 mt-1 text-sm text-slate-600">
                        <MapPin className="h-4 w-4" />
                        {property.address}, {property.city}, {property.state} {property.zip_code}
                      </div>
                    </div>
                    {(() => {
                      const existingClaim = existingClaims[property.id]
                      console.log("Status check for property:", property.id, "existingClaim:", existingClaim, "userId:", userId)
                      
                      if (existingClaim) {
                        if (existingClaim.claimant_id === userId) {
                          return (
                            <Badge variant="outline" className="border-orange-300 text-orange-700">
                              Claim Pending
                            </Badge>
                          )
                        } else {
                          return (
                            <Badge variant="secondary">
                              Claimed by Others
                            </Badge>
                          )
                        }
                      } else if (property.is_seed_property) {
                        return (
                          <Badge variant="default">
                            Available to Claim
                          </Badge>
                        )
                      } else {
                        return (
                          <Badge variant="secondary">
                            Already Owned
                          </Badge>
                        )
                      }
                    })()}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-slate-500" />
                      <span>{property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-slate-500" />
                      <span>{property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="h-4 w-4 text-slate-500" />
                      <span>{property.square_feet?.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-500" />
                      <span>${property.listing_price?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Claim Form */}
                  {(() => {
                    const existingClaim = existingClaims[property.id]
                    const canClaim = property.is_seed_property && !existingClaim
                    
                    if (canClaim) {
                      return (
                        <div className="space-y-3 pt-4 border-t">
                          <div>
                            <Label htmlFor={`reason-${property.id}`}>Why do you own this property?</Label>
                            <Textarea
                              id={`reason-${property.id}`}
                              placeholder="Explain why you own this property (e.g., 'I am the legal owner of this property')"
                              value={claimReason}
                              onChange={(e) => setClaimReason(e.target.value)}
                              rows={3}
                            />
                          </div>
                          
                          <Button
                            onClick={() => claimProperty(property.id)}
                            disabled={claiming === property.id || !claimReason.trim()}
                            className="w-full"
                          >
                            {claiming === property.id ? 'Submitting Claim...' : 'Claim This Property'}
                          </Button>
                        </div>
                      )
                    } else if (existingClaim && existingClaim.claimant_id === userId) {
                      return (
                        <div className="pt-4 border-t">
                          <div className="text-sm text-orange-600 bg-orange-50 p-3 rounded-lg">
                            <strong>Claim Pending:</strong> You have already submitted a claim for this property. An admin will review it and notify you of the decision.
                          </div>
                        </div>
                      )
                    } else if (existingClaim) {
                      return (
                        <div className="pt-4 border-t">
                          <div className="text-sm text-slate-600">
                            This property has already been claimed by another user.
                          </div>
                        </div>
                      )
                    } else {
                      return (
                        <div className="pt-4 border-t">
                          <div className="text-sm text-slate-600">
                            This property is not available for claiming.
                          </div>
                        </div>
                      )
                    }
                  })()}
                  
                  {!property.is_seed_property && (
                    <div className="text-sm text-slate-500 pt-4 border-t">
                      This property is already owned by another seller.
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {searchResults.length === 0 && searchAddress && !loading && (
        <Card>
          <CardContent className="py-8 text-center">
            <Home className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Properties Found</h3>
            <p className="text-slate-600">
              No properties found matching "{searchAddress}". Try a different address or check the spelling.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
