"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, Clock, User, MapPin, Home } from "lucide-react"
import { PropertyClaim } from "@/lib/types"

interface PropertyClaimWithDetails extends PropertyClaim {
  property: {
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
  }
  claimant: {
    id: string
    full_name: string | null
    email: string
  }
}

export function PropertyClaims() {
  const [claims, setClaims] = useState<PropertyClaimWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<string | null>(null)
  const [verificationNotes, setVerificationNotes] = useState<Record<string, string>>({})
  const supabase = createClient()

  const fetchClaims = async () => {
    const { data, error } = await supabase
      .from("property_claims")
      .select(`
        *,
        property:properties (
          id,
          title,
          address,
          city,
          state,
          zip_code,
          listing_price,
          bedrooms,
          bathrooms,
          square_feet
        ),
        claimant:profiles (
          id,
          full_name,
          email
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching claims:", error)
    } else {
      setClaims(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchClaims()
  }, [])

  const handleClaimAction = async (claimId: string, action: "approved" | "rejected") => {
    setProcessing(claimId)
    
    try {
      const { error } = await supabase.rpc('approve_property_claim', {
        claim_id: claimId,
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })

      if (error) throw error

      // Update the claim status
      const { error: updateError } = await supabase
        .from("property_claims")
        .update({
          claim_status: action,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          verification_notes: verificationNotes[claimId] || null
        })
        .eq("id", claimId)

      if (updateError) throw updateError

      // Refresh the claims list
      await fetchClaims()
      
    } catch (error) {
      console.error("Error processing claim:", error)
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading property claims...</div>
  }

  const pendingClaims = claims.filter(claim => claim.claim_status === "pending")
  const approvedClaims = claims.filter(claim => claim.claim_status === "approved")
  const rejectedClaims = claims.filter(claim => claim.claim_status === "rejected")

  return (
    <div className="space-y-8">
      {/* Pending Claims */}
      {pendingClaims.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Property Claims ({pendingClaims.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingClaims.map((claim) => (
              <Card key={claim.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{claim.property.title}</CardTitle>
                    <Badge variant="outline" className="border-orange-300 text-orange-700">
                      Pending Review
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    {claim.property.address}, {claim.property.city}, {claim.property.state}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-slate-500" />
                      <span>{claim.property.bedrooms} beds</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{claim.property.bathrooms} baths</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{claim.property.square_feet?.toLocaleString()} sqft</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>${claim.property.listing_price?.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Claimant Info */}
                  <div className="border-t pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-slate-500" />
                      <span className="font-medium">Claimant:</span>
                      <span>{claim.claimant.full_name || 'Unknown'}</span>
                    </div>
                    <p className="text-sm text-slate-600">{claim.claimant.email}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Claim Reason:</strong> {claim.claim_reason || 'No reason provided'}
                    </p>
                  </div>

                  {/* Admin Notes */}
                  <div>
                    <Label htmlFor={`notes-${claim.id}`}>Admin Notes (Optional)</Label>
                    <Textarea
                      id={`notes-${claim.id}`}
                      placeholder="Add notes about this claim review..."
                      value={verificationNotes[claim.id] || ""}
                      onChange={(e) => setVerificationNotes(prev => ({
                        ...prev,
                        [claim.id]: e.target.value
                      }))}
                      rows={3}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleClaimAction(claim.id, "approved")}
                      disabled={processing === claim.id}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {processing === claim.id ? 'Processing...' : 'Approve Claim'}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleClaimAction(claim.id, "rejected")}
                      disabled={processing === claim.id}
                      className="flex-1"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {processing === claim.id ? 'Processing...' : 'Reject Claim'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Approved Claims */}
      {approvedClaims.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Approved Claims ({approvedClaims.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {approvedClaims.map((claim) => (
              <Card key={claim.id} className="border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{claim.property.title}</h3>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Approved
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {claim.property.address}, {claim.property.city}, {claim.property.state}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Claimant:</strong> {claim.claimant.full_name || 'Unknown'} ({claim.claimant.email})
                  </p>
                  {claim.verification_notes && (
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Admin Notes:</strong> {claim.verification_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Rejected Claims */}
      {rejectedClaims.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />
            Rejected Claims ({rejectedClaims.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedClaims.map((claim) => (
              <Card key={claim.id} className="border-red-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900">{claim.property.title}</h3>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {claim.property.address}, {claim.property.city}, {claim.property.state}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Claimant:</strong> {claim.claimant.full_name || 'Unknown'} ({claim.claimant.email})
                  </p>
                  {claim.verification_notes && (
                    <p className="text-sm text-slate-600 mt-1">
                      <strong>Admin Notes:</strong> {claim.verification_notes}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Claims */}
      {claims.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Property Claims</h3>
            <p className="text-slate-600">
              No property claims have been submitted yet.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
