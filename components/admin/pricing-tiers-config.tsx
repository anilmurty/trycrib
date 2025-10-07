"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Settings, 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  DollarSign
} from "lucide-react"
import { PRICING_TIERS, PricingTier, getPricingTierInfo } from "@/lib/pricing"

interface TierConfig {
  tier: PricingTier
  name: string
  description: string
  pricePerNight: number | null
  color: string
  minPrice: number
  maxPrice: number | null
}

export function PricingTiersConfig() {
  const [tiers, setTiers] = useState<TierConfig[]>([])
  const [editingTier, setEditingTier] = useState<PricingTier | null>(null)
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    pricePerNight: 0,
    minPrice: 0,
    maxPrice: 0
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    // Initialize tiers from the pricing library
    const initialTiers = Object.values(PRICING_TIERS).map(tier => ({
      tier: tier.tier,
      name: tier.name,
      description: tier.description,
      pricePerNight: tier.pricePerNight,
      color: tier.color,
      minPrice: tier.minPrice,
      maxPrice: tier.maxPrice
    }))
    setTiers(initialTiers)
  }, [])

  const handleEditTier = (tier: TierConfig) => {
    setEditingTier(tier.tier)
    setEditForm({
      name: tier.name,
      description: tier.description,
      pricePerNight: tier.pricePerNight || 0,
      minPrice: tier.minPrice,
      maxPrice: tier.maxPrice || 0
    })
  }

  const handleSaveTier = async () => {
    if (!editingTier) return

    setSaving(true)
    setMessage(null)

    try {
      // In a real implementation, you'd save to a database
      // For now, we'll just update the local state
      setTiers(prev => prev.map(tier => 
        tier.tier === editingTier 
          ? {
              ...tier,
              name: editForm.name,
              description: editForm.description,
              pricePerNight: editForm.pricePerNight || null,
              minPrice: editForm.minPrice,
              maxPrice: editForm.maxPrice || null
            }
          : tier
      ))

      setMessage({ type: 'success', text: 'Pricing tier updated successfully!' })
      setEditingTier(null)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update pricing tier' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefaults = () => {
    const defaultTiers = Object.values(PRICING_TIERS).map(tier => ({
      tier: tier.tier,
      name: tier.name,
      description: tier.description,
      pricePerNight: tier.pricePerNight,
      color: tier.color,
      minPrice: tier.minPrice,
      maxPrice: tier.maxPrice
    }))
    setTiers(defaultTiers)
    setMessage({ type: 'success', text: 'Reset to default pricing tiers' })
  }

  const getTierColor = (color: string) => {
    const colorClasses = {
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      purple: 'bg-purple-100 text-purple-800',
      orange: 'bg-orange-100 text-orange-800',
      red: 'bg-red-100 text-red-800',
      gray: 'bg-gray-100 text-gray-800'
    }
    return colorClasses[color as keyof typeof colorClasses] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Tiers Configuration</h2>
          <p className="text-gray-600">Manage the pricing structure for different property value ranges</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleResetToDefaults}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-green-50 text-green-800 border border-green-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          {message.text}
        </div>
      )}

      {/* Tiers List */}
      <div className="grid gap-4">
        {tiers.map((tier) => (
          <Card key={tier.tier}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={getTierColor(tier.color)}>
                    {tier.name}
                  </Badge>
                  <div>
                    <h3 className="font-semibold">{tier.name}</h3>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEditTier(tier)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Price Range</Label>
                  <p className="text-sm text-gray-600">
                    ${tier.minPrice.toLocaleString()} - {tier.maxPrice ? `$${tier.maxPrice.toLocaleString()}` : '∞'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Nightly Rate</Label>
                  <p className="text-sm text-gray-600">
                    {tier.pricePerNight ? `$${tier.pricePerNight.toLocaleString()}/night` : 'Contact listing agent'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Properties</Label>
                  <p className="text-sm text-gray-600">
                    {/* This would be calculated from actual property data */}
                    Loading...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Modal */}
      {editingTier && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Edit Pricing Tier: {tiers.find(t => t.tier === editingTier)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tierName">Tier Name</Label>
                <Input
                  id="tierName"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Under $500K"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tierDescription">Description</Label>
                <Input
                  id="tierDescription"
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="e.g., Properties under $500,000"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="minPrice">Minimum Price</Label>
                <Input
                  id="minPrice"
                  type="number"
                  value={editForm.minPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, minPrice: parseInt(e.target.value) || 0 }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxPrice">Maximum Price</Label>
                <Input
                  id="maxPrice"
                  type="number"
                  value={editForm.maxPrice}
                  onChange={(e) => setEditForm(prev => ({ ...prev, maxPrice: parseInt(e.target.value) || 0 }))}
                  placeholder="Leave empty for unlimited"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="pricePerNight">Price Per Night</Label>
                <Input
                  id="pricePerNight"
                  type="number"
                  value={editForm.pricePerNight}
                  onChange={(e) => setEditForm(prev => ({ ...prev, pricePerNight: parseInt(e.target.value) || 0 }))}
                  placeholder="0 for contact agent"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button 
                onClick={handleSaveTier}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => setEditingTier(null)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Important Notes</h4>
              <ul className="text-sm text-blue-800 mt-1 space-y-1">
                <li>• Changes to pricing tiers will affect all properties in those ranges</li>
                <li>• Properties with custom pricing overrides will not be affected</li>
                <li>• Consider running a bulk recalculation after making changes</li>
                <li>• Set price per night to 0 for "Contact listing agent" pricing</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
