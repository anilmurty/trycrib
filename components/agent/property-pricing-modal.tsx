"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { DollarSign, AlertCircle, CheckCircle } from "lucide-react"
import { toast } from "sonner"

interface PropertyPricingModalProps {
  property: {
    id: string
    title: string
    city: string
    state: string
    listing_price: number
    price_per_night: number | null
    pricing_tier: string | null
    is_active: boolean
  }
  onPricingUpdated: () => void
}

interface PricingTier {
  tier: string
  min_price: number
  max_price: number
  price_per_night: number
  description: string
}

export function PropertyPricingModal({ property, onPricingUpdated }: PropertyPricingModalProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([])
  const [selectedTier, setSelectedTier] = useState<string>("")
  const [customPrice, setCustomPrice] = useState<number>(0)
  const [useCustomPrice, setUseCustomPrice] = useState(false)
  const [notes, setNotes] = useState("")
  const [sellerApproval, setSellerApproval] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function fetchPricingTiers() {
      try {
        const { data } = await supabase
          .from("pricing_tiers")
          .select("*")
          .order("min_price", { ascending: true })

        if (data) {
          setPricingTiers(data)
          // Pre-select tier based on listing price
          const matchingTier = data.find(tier => 
            property.listing_price >= tier.min_price && 
            property.listing_price <= tier.max_price
          )
          if (matchingTier) {
            setSelectedTier(matchingTier.tier)
            setCustomPrice(matchingTier.price_per_night)
          }
        }
      } catch (error) {
        console.error("Error fetching pricing tiers:", error)
        toast.error("Failed to load pricing tiers")
      }
    }

    if (open) {
      fetchPricingTiers()
    }
  }, [open, property.listing_price, supabase])

  const handleSavePricing = async () => {
    if (!sellerApproval) {
      toast.error("Seller approval is required before setting pricing")
      return
    }

    if (!useCustomPrice && !selectedTier) {
      toast.error("Please select a pricing tier or enter a custom price")
      return
    }

    if (useCustomPrice && customPrice <= 0) {
      toast.error("Please enter a valid custom price")
      return
    }

    setLoading(true)

    try {
      const finalPrice = useCustomPrice ? customPrice : 
        pricingTiers.find(tier => tier.tier === selectedTier)?.price_per_night || 0

      const { error } = await supabase
        .from("properties")
        .update({
          price_per_night: finalPrice,
          pricing_tier: useCustomPrice ? "custom" : selectedTier,
          pricing_notes: notes,
          pricing_set_by: "agent",
          pricing_set_at: new Date().toISOString(),
          pricing_approved_by_seller: true
        })
        .eq("id", property.id)

      if (error) {
        throw error
      }

      toast.success("Property pricing updated successfully")
      setOpen(false)
      onPricingUpdated()
    } catch (error) {
      console.error("Error updating pricing:", error)
      toast.error("Failed to update pricing")
    } finally {
      setLoading(false)
    }
  }

  const selectedTierData = pricingTiers.find(tier => tier.tier === selectedTier)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Set Pricing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Set Property Pricing
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900">{property.title}</h3>
            <p className="text-sm text-slate-600">{property.city}, {property.state}</p>
            <p className="text-sm text-slate-600">
              Listed for: ${property.listing_price.toLocaleString()}
            </p>
          </div>

          {/* Pricing Tiers */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Pricing Tier</Label>
            <div className="grid gap-3">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedTier === tier.tier && !useCustomPrice
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    setSelectedTier(tier.tier)
                    setUseCustomPrice(false)
                    setCustomPrice(tier.price_per_night)
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{tier.tier}</div>
                      <div className="text-sm text-slate-600">
                        ${tier.min_price.toLocaleString()} - ${tier.max_price.toLocaleString()}
                      </div>
                      <div className="text-sm text-slate-500">{tier.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">
                        ${tier.price_per_night}/night
                      </div>
                      {selectedTier === tier.tier && !useCustomPrice && (
                        <Badge variant="default" className="mt-1">Selected</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Price Option */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="custom-price"
                checked={useCustomPrice}
                onChange={(e) => {
                  setUseCustomPrice(e.target.checked)
                  if (e.target.checked) {
                    setSelectedTier("")
                  }
                }}
                className="rounded"
              />
              <Label htmlFor="custom-price" className="text-base font-semibold">
                Use Custom Price
              </Label>
            </div>

            {useCustomPrice && (
              <div className="space-y-2">
                <Label htmlFor="custom-price-input">Custom Price per Night</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-slate-500" />
                  <Input
                    id="custom-price-input"
                    type="number"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(Number(e.target.value))}
                    placeholder="Enter custom price"
                    min="0"
                    step="1"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="pricing-notes">Notes (Optional)</Label>
            <Textarea
              id="pricing-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this pricing decision..."
              rows={3}
            />
          </div>

          {/* Seller Approval */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-semibold text-amber-800">Seller Approval Required</h4>
                <p className="text-sm text-amber-700">
                  All pricing must be approved by the property owner before it goes live.
                </p>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="seller-approval"
                    checked={sellerApproval}
                    onChange={(e) => setSellerApproval(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="seller-approval" className="text-sm">
                    I confirm that the seller has approved this pricing
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Current Pricing Display */}
          {property.price_per_night && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-semibold text-green-800">Current Pricing</div>
                  <div className="text-sm text-green-700">
                    ${property.price_per_night}/night
                    {property.pricing_tier && ` (${property.pricing_tier})`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSavePricing} 
              disabled={loading || !sellerApproval}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Saving..." : "Save Pricing"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
