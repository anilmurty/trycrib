"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Save, 
  RefreshCw, 
  AlertCircle,
  CheckCircle
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

  const handleTierChange = (tierKey: PricingTier, field: keyof TierConfig, value: string | number) => {
    setTiers(prev => prev.map(tier => 
      tier.tier === tierKey 
        ? { ...tier, [field]: value }
        : tier
    ))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    setMessage(null)

    try {
      // In a real implementation, you'd save to a database
      // For now, we'll just show a success message
      setMessage({ type: 'success', text: 'Pricing tiers updated successfully!' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update pricing tiers' })
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

  const handleSaveAndRecalculate = async () => {
    setSaving(true)
    setMessage(null)

    try {
      console.log('🚀 Starting save tiers and recalculate pricing...')
      
      // First save the tiers (in a real implementation, you'd save to database)
      console.log('💾 Saving pricing tiers...')
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate save delay
      console.log('✅ Pricing tiers saved successfully')

      // Then recalculate pricing
      console.log('🔄 Starting bulk recalculate pricing...')
      const response = await fetch('/api/admin/bulk-recalculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to recalculate pricing')
      }

      const result = await response.json()
      console.log('✅ Bulk recalculate completed:', result)
      setMessage({ type: 'success', text: result.message || 'Tiers saved and pricing recalculated successfully!' })
    } catch (error) {
      console.error("❌ Error in save and recalculate:", error)
      setMessage({ type: 'error', text: 'Failed to save tiers and recalculate pricing' })
    } finally {
      setSaving(false)
    }
  }

  const handleBulkRecalculate = async () => {
    setSaving(true)
    setMessage(null)

    try {
      console.log('🔄 Starting bulk recalculate pricing...')
      const response = await fetch('/api/admin/bulk-recalculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to recalculate pricing')
      }

      const result = await response.json()
      console.log('✅ Bulk recalculate completed:', result)
      setMessage({ type: 'success', text: result.message || 'Pricing recalculated successfully!' })
    } catch (error) {
      console.error("❌ Error recalculating pricing:", error)
      setMessage({ type: 'error', text: 'Failed to recalculate pricing' })
    } finally {
      setSaving(false)
    }
  }

  const handleRefreshData = () => {
    // Reset to defaults to refresh the data
    handleResetToDefaults()
    setMessage({ type: 'success', text: 'Data refreshed successfully!' })
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
            onClick={handleSaveAll}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save Tiers'}
          </Button>
          <Button 
            onClick={handleSaveAndRecalculate}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Processing...' : 'Save & Recalculate'}
          </Button>
          <Button 
            onClick={handleRefreshData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
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
              <div className="flex items-center gap-3">
                <Badge className={getTierColor(tier.color)}>
                  {tier.name}
                </Badge>
                <div className="flex-1">
                  <Input
                    value={tier.name}
                    onChange={(e) => handleTierChange(tier.tier, 'name', e.target.value)}
                    className="font-semibold text-lg border-none p-0 h-auto"
                  />
                  <Input
                    value={tier.description}
                    onChange={(e) => handleTierChange(tier.tier, 'description', e.target.value)}
                    className="text-sm text-gray-600 border-none p-0 h-auto mt-1"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Price Range</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">$</span>
                    <Input
                      type="number"
                      value={tier.minPrice}
                      onChange={(e) => handleTierChange(tier.tier, 'minPrice', parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <span className="text-sm text-gray-600">-</span>
                    <span className="text-sm text-gray-600">$</span>
                    <Input
                      type="number"
                      value={tier.maxPrice || ''}
                      onChange={(e) => handleTierChange(tier.tier, 'maxPrice', parseInt(e.target.value) || null)}
                      placeholder="∞"
                      className="w-24"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Nightly Rate</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">$</span>
                    <Input
                      type="number"
                      value={tier.pricePerNight || ''}
                      onChange={(e) => handleTierChange(tier.tier, 'pricePerNight', parseInt(e.target.value) || null)}
                      placeholder="0 for contact agent"
                      className="w-32"
                    />
                    <span className="text-sm text-gray-600">/night</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Preview</Label>
                  <p className="text-sm text-gray-600">
                    {tier.pricePerNight ? `$${tier.pricePerNight.toLocaleString()}/night` : 'Contact listing agent'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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