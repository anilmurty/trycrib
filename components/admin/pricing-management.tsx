"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PricingTiersConfig } from "./pricing-tiers-config"
import { 
  DollarSign, 
  Settings, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Save,
  X
} from "lucide-react"
import { 
  PRICING_TIERS, 
  PricingTier, 
  getPricingTierInfo, 
  calculatePricingTier, 
  calculatePricePerNight 
} from "@/lib/pricing"

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  listing_price: number | null
  pricing_tier: PricingTier | null
  calculated_price_per_night: number | null
  pricing_override: boolean
  custom_price_per_night: number | null
  price_per_night: number
}

interface PricingStats {
  totalProperties: number
  autoPriced: number
  customPriced: number
  tierDistribution: Record<string, number>
}

export function PricingManagement() {
  const supabase = createClient()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<PricingStats>({
    totalProperties: 0,
    autoPriced: 0,
    customPriced: 0,
    tierDistribution: {}
  })
  const [editingProperty, setEditingProperty] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    pricingOverride: false,
    customPricePerNight: 0,
    listingPrice: 0
  })
  const [saving, setSaving] = useState(false)

  const fetchProperties = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("properties")
        .select(`
          id,
          title,
          address,
          city,
          state,
          listing_price,
          pricing_tier,
          calculated_price_per_night,
          pricing_override,
          custom_price_per_night,
          price_per_night
        `)
        .order("listing_price", { ascending: false })

      if (error) {
        console.error("Error fetching properties:", error)
        return
      }

      setProperties(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (props: Property[]) => {
    const totalProperties = props.length
    const autoPriced = props.filter(p => !p.pricing_override).length
    const customPriced = props.filter(p => p.pricing_override).length
    
    const tierDistribution: Record<string, number> = {}
    props.forEach(prop => {
      if (prop.pricing_tier) {
        const tierName = getPricingTierInfo(prop.pricing_tier)?.name || prop.pricing_tier
        tierDistribution[tierName] = (tierDistribution[tierName] || 0) + 1
      }
    })

    setStats({
      totalProperties,
      autoPriced,
      customPriced,
      tierDistribution
    })
  }

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property.id)
    setEditForm({
      pricingOverride: property.pricing_override,
      customPricePerNight: property.custom_price_per_night || 0,
      listingPrice: property.listing_price || 0
    })
  }

  const handleSaveProperty = async (propertyId: string) => {
    setSaving(true)
    try {
      const response = await fetch(`/api/pricing/property/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (!response.ok) {
        throw new Error('Failed to update property pricing')
      }

      await fetchProperties()
      setEditingProperty(null)
    } catch (error) {
      console.error("Error updating property:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleBulkRecalculate = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/bulk-recalculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to recalculate pricing')
      }

      await fetchProperties()
    } catch (error) {
      console.error("Error recalculating pricing:", error)
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    fetchProperties()
  }, [])

  const getEffectivePricePerNight = (property: Property) => {
    if (property.pricing_override && property.custom_price_per_night) {
      return property.custom_price_per_night
    }
    return property.calculated_price_per_night || property.price_per_night
  }

  const getTierColor = (tier: PricingTier | null) => {
    if (!tier) return 'bg-gray-100 text-gray-800'
    const tierInfo = getPricingTierInfo(tier)
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    return colorClasses[tierInfo?.color || 'gray'] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading pricing data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
        <span className="font-medium text-gray-700">Admin Dashboard</span>
        <span>›</span>
        <span className="font-medium text-blue-600">Pricing Management</span>
        <span>›</span>
        <span className="text-gray-500">Sub-sections below</span>
      </div>

      <Tabs defaultValue="tiers" className="space-y-6">
        <div className="bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
          <TabsList className="grid w-full grid-cols-2 h-12 bg-transparent">
            <TabsTrigger 
              value="tiers" 
              className="text-sm font-semibold data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Pricing Tiers</span>
                <span className="text-xs text-gray-500">(Configure rates)</span>
              </div>
            </TabsTrigger>
            <TabsTrigger 
              value="properties" 
              className="text-sm font-semibold data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-b-2 data-[state=active]:border-green-500 data-[state=active]:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Property Management</span>
                <span className="text-xs text-gray-500">(Individual edits)</span>
              </div>
            </TabsTrigger>
          </TabsList>
        </div>


        <TabsContent value="tiers">
          <PricingTiersConfig />
        </TabsContent>

        <TabsContent value="properties">
          {/* Properties List */}
          <Card>
            <CardHeader>
              <CardTitle>Property Pricing Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {properties.map((property) => (
                  <div key={property.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{property.title}</h3>
                        <p className="text-sm text-gray-600">
                          {property.address}, {property.city}, {property.state}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm">
                            <strong>Listed:</strong> ${property.listing_price?.toLocaleString() || 'N/A'}
                          </span>
                          <span className="text-sm">
                            <strong>Nightly:</strong> ${getEffectivePricePerNight(property).toLocaleString()}
                          </span>
                          {property.pricing_tier && (
                            <Badge className={getTierColor(property.pricing_tier)}>
                              {getPricingTierInfo(property.pricing_tier)?.name}
                            </Badge>
                          )}
                          {property.pricing_override && (
                            <Badge variant="outline" className="text-blue-600">
                              Custom Price
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {editingProperty === property.id ? (
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveProperty(property.id)}
                              disabled={saving}
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingProperty(null)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProperty(property)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {editingProperty === property.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="listingPrice">Listing Price</Label>
                            <Input
                              id="listingPrice"
                              type="number"
                              value={editForm.listingPrice}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                listingPrice: parseInt(e.target.value) || 0
                              }))}
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="pricingOverride"
                                checked={editForm.pricingOverride}
                                onCheckedChange={(checked) => setEditForm(prev => ({
                                  ...prev,
                                  pricingOverride: checked
                                }))}
                              />
                              <Label htmlFor="pricingOverride">Custom Pricing</Label>
                            </div>
                          </div>
                        </div>

                        {editForm.pricingOverride && (
                          <div className="space-y-2">
                            <Label htmlFor="customPrice">Custom Price Per Night</Label>
                            <Input
                              id="customPrice"
                              type="number"
                              value={editForm.customPricePerNight}
                              onChange={(e) => setEditForm(prev => ({
                                ...prev,
                                customPricePerNight: parseInt(e.target.value) || 0
                              }))}
                            />
                          </div>
                        )}

                        {!editForm.pricingOverride && editForm.listingPrice > 0 && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                              <strong>Calculated Tier:</strong> {getPricingTierInfo(calculatePricingTier(editForm.listingPrice))?.name || 'N/A'}
                            </p>
                            <p className="text-sm text-blue-800">
                              <strong>Calculated Price:</strong> ${calculatePricePerNight(calculatePricingTier(editForm.listingPrice))?.toLocaleString() || 'N/A'}/night
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}