"use client"

import { useState, useEffect, useRef } from "react"
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
  const [originalTiers, setOriginalTiers] = useState<TierConfig[]>([])
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const processingRef = useRef(false)
  const [propertyCounts, setPropertyCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // Load current pricing tiers from database
    loadPricingTiers()
    // Load property counts
    loadPropertyCounts()
  }, [])

  const loadPricingTiers = async () => {
    try {
      console.log('📊 Loading current pricing tiers from database...')
      const response = await fetch('/api/admin/pricing-tiers')
      if (!response.ok) {
        throw new Error('Failed to load pricing tiers')
      }
      
      const result = await response.json()
      if (result.success && result.data) {
        console.log('✅ Loaded pricing tiers from database:', result.data)
        setTiers(result.data)
        setOriginalTiers(result.data) // Store original for comparison
      } else {
        // Fallback to hardcoded values if database fetch fails
        console.log('⚠️ Using fallback pricing tiers')
        const fallbackTiers = Object.values(PRICING_TIERS).map(tier => ({
          tier: tier.tier,
          name: tier.name,
          description: tier.description,
          pricePerNight: tier.pricePerNight,
          color: tier.color,
          minPrice: tier.minPrice,
          maxPrice: tier.maxPrice
        }))
        setTiers(fallbackTiers)
      }
    } catch (error) {
      console.error('❌ Error loading pricing tiers:', error)
      // Fallback to hardcoded values
      const fallbackTiers = Object.values(PRICING_TIERS).map(tier => ({
        tier: tier.tier,
        name: tier.name,
        description: tier.description,
        pricePerNight: tier.pricePerNight,
        color: tier.color,
        minPrice: tier.minPrice,
        maxPrice: tier.maxPrice
      }))
      setTiers(fallbackTiers)
    }
  }

  const loadPropertyCounts = async () => {
    try {
      console.log('📊 Loading property counts by tier...')
      const response = await fetch('/api/admin/pricing-tiers/property-counts')

      if (!response.ok) {
        throw new Error('Failed to fetch property counts')
      }

      const result = await response.json()
      console.log('✅ Property counts fetched successfully:', result.data)
      
      if (result.success && result.data) {
        setPropertyCounts(result.data)
      }
    } catch (error) {
      console.error('❌ Error loading property counts:', error)
      // Set empty counts as fallback
      setPropertyCounts({})
    }
  }

  const handleTierChange = (tierKey: PricingTier, field: keyof TierConfig, value: string | number) => {
    setTiers(prev => prev.map(tier => 
      tier.tier === tierKey 
        ? { ...tier, [field]: value }
        : tier
    ))
  }

  // Function to detect which tiers have changed
  const getChangedTiers = (): string[] => {
    console.log('🔍 Checking for changed tiers...')
    console.log('📊 Current tiers:', tiers.map(t => `${t.tier}: $${t.pricePerNight}`))
    console.log('📊 Original tiers:', originalTiers.map(t => `${t.tier}: $${t.pricePerNight}`))
    
    if (originalTiers.length === 0) {
      console.log('⚠️ No original tiers to compare against')
      return []
    }
    
    const changedTiers: string[] = []
    
    for (const currentTier of tiers) {
      const originalTier = originalTiers.find(t => t.tier === currentTier.tier)
      if (!originalTier) {
        console.log(`⚠️ No original tier found for ${currentTier.tier}`)
        continue
      }
      
      // Check if pricePerNight has changed
      if (currentTier.pricePerNight !== originalTier.pricePerNight) {
        console.log(`✅ Tier ${currentTier.tier} changed: ${originalTier.pricePerNight} → ${currentTier.pricePerNight}`)
        changedTiers.push(currentTier.tier)
      } else {
        console.log(`➖ Tier ${currentTier.tier} unchanged: ${currentTier.pricePerNight}`)
      }
    }
    
    console.log('🎯 Detected changed tiers:', changedTiers)
    return changedTiers
  }

  const handleSaveAndRecalculate = async () => {
    // Prevent multiple simultaneous operations using ref for immediate check
    if (processingRef.current) {
      console.log('⚠️ Operation already in progress, ignoring request')
      return
    }

    console.log('🚀 Starting operation - setting states to true')
    processingRef.current = true
    setSaving(true)
    setIsProcessing(true)
    setMessage(null)

    try {
      console.log('🚀 Starting save tiers and recalculate pricing...')
      
      // Get changed tiers BEFORE saving (so we can detect what changed)
      const changedTiers = getChangedTiers()
      console.log('🔍 Detected changed tiers before save:', changedTiers)
      
      // Also log to help debug
      console.log('🔍 DEBUG: originalTiers length:', originalTiers.length)
      console.log('🔍 DEBUG: current tiers length:', tiers.length)
      console.log('🔍 DEBUG: originalTiers:', originalTiers.map(t => `${t.tier}: $${t.pricePerNight}`))
      console.log('🔍 DEBUG: current tiers:', tiers.map(t => `${t.tier}: $${t.pricePerNight}`))
      
      // First save the tiers to database
      console.log('💾 Saving pricing tiers to database...', tiers)
      const saveResponse = await fetch('/api/admin/pricing-tiers', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tiers }),
      })

      if (!saveResponse.ok) {
        throw new Error('Failed to save pricing tiers')
      }

      const saveResult = await saveResponse.json()
      console.log('✅ Pricing tiers saved successfully:', saveResult)

      // Recalculate only the tiers that were changed
      console.log('🔄 Starting bulk recalculate pricing...', changedTiers.length > 0 ? `for changed tiers: ${changedTiers.join(', ')}` : 'for all tiers')
      
      const recalcResponse = await fetch('/api/admin/bulk-recalculate-pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ affectedTiers: changedTiers }),
      })

      if (!recalcResponse.ok) {
        throw new Error('Failed to recalculate pricing')
      }

      const recalcResult = await recalcResponse.json()
      console.log('✅ Bulk recalculate completed:', recalcResult)
      setOriginalTiers(tiers) // Update original tiers after successful save
      // Refresh property counts after recalculation
      await loadPropertyCounts()
      setMessage({ type: 'success', text: recalcResult.message || 'Tiers saved and pricing recalculated successfully!' })
    } catch (error) {
      console.error("❌ Error in save and recalculate:", error)
      setMessage({ type: 'error', text: 'Failed to save tiers and recalculate pricing' })
    } finally {
      processingRef.current = false
      setSaving(false)
      setIsProcessing(false)
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


  const handleBulkRecalculate = async () => {
    // Prevent multiple simultaneous operations using ref for immediate check
    if (processingRef.current) {
      console.log('⚠️ Operation already in progress, ignoring request')
      return
    }

    processingRef.current = true
    setSaving(true)
    setIsProcessing(true)
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
      // Refresh property counts after recalculation
      await loadPropertyCounts()
      setMessage({ type: 'success', text: result.message || 'Pricing recalculated successfully!' })
    } catch (error) {
      console.error("❌ Error recalculating pricing:", error)
      setMessage({ type: 'error', text: 'Failed to recalculate pricing' })
    } finally {
      processingRef.current = false
      setSaving(false)
      setIsProcessing(false)
    }
  }

  const handleRefreshData = () => {
    // Reload from database
    loadPricingTiers()
    loadPropertyCounts()
    setMessage({ type: 'success', text: 'Data refreshed from database!' })
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
            onClick={handleSaveAndRecalculate}
            disabled={saving || isProcessing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${(saving || isProcessing) ? 'animate-spin' : ''}`} />
            {(saving || isProcessing) ? 'Processing...' : 'Save & Recalculate'}
          </Button>
          <Button 
            onClick={handleBulkRecalculate}
            disabled={saving || isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recalculate All
          </Button>
          <Button 
            onClick={handleRefreshData}
            disabled={saving || isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </Button>
          <Button 
            onClick={handleResetToDefaults}
            disabled={saving || isProcessing}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reset to Defaults
          </Button>
        </div>
      </div>

      {/* Processing Indicator */}
      {(saving || isProcessing) && (
        <div className="p-4 rounded-lg flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Processing pricing updates... This may take a few minutes for large datasets.</span>
        </div>
      )}

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
              <div className="grid gap-4 md:grid-cols-4">
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
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">Properties</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-sm">
                      {propertyCounts[tier.tier] || 0} properties
                    </Badge>
                  </div>
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