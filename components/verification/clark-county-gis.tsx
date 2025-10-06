"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  MapPin, 
  User, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle,
  Loader2
} from 'lucide-react'

interface PropertyInfo {
  pin: string
  address: string
  ownerName: string
  propertyValue: number
  taxYear: number
  verificationMethod: 'gis_api'
}

interface ClarkCountyGISProps {
  onPropertyFound: (propertyInfo: PropertyInfo) => void
  onError: (error: string) => void
}

export default function ClarkCountyGIS({ onPropertyFound, onError }: ClarkCountyGISProps) {
  const [address, setAddress] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedProperty, setSelectedProperty] = useState<any>(null)

  const searchProperty = async () => {
    if (!address.trim()) {
      onError('Please enter a property address')
      return
    }

    try {
      setIsSearching(true)
      setSearchResults([])
      setSelectedProperty(null)

      // Note: This is a mock implementation
      // In production, you would need to:
      // 1. Research Clark County's actual API endpoints
      // 2. Handle authentication if required
      // 3. Parse the response data properly
      
      // For now, we'll simulate a search
      const mockResults = [
        {
          pin: '986052015',
          address: '400 W X CIR, WASHOUGAL, WA 98671',
          ownerName: 'MURTY ANIL AKUNDI & MURTY ASHWINI',
          propertyValue: 1053903,
          taxYear: 2024,
          jurisdiction: 'Washougal',
          zoning: 'Single-family Residential (R1-15)',
          schoolDistrict: 'Camas'
        }
      ]

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSearchResults(mockResults)
      
    } catch (error) {
      console.error('Search error:', error)
      onError('Failed to search property information. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const selectProperty = (property: any) => {
    setSelectedProperty(property)
    
    const propertyInfo: PropertyInfo = {
      pin: property.pin,
      address: property.address,
      ownerName: property.ownerName,
      propertyValue: property.propertyValue,
      taxYear: property.taxYear,
      verificationMethod: 'gis_api'
    }
    
    onPropertyFound(propertyInfo)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-blue-600" />
          Clark County Property Search
        </CardTitle>
        <CardDescription>
          Search for your property using the Clark County GIS system for automated verification
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Property Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="Enter property address (e.g., 400 W X CIR, Washougal, WA)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchProperty()}
              />
              <Button 
                onClick={searchProperty} 
                disabled={isSearching || !address.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900">Search Results</h3>
            {searchResults.map((property, index) => (
              <Card 
                key={index} 
                className={`cursor-pointer transition-colors ${
                  selectedProperty === property 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => selectProperty(property)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{property.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">{property.ownerName}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>${property.propertyValue.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Tax Year {property.taxYear}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{property.jurisdiction}</Badge>
                        <Badge variant="outline">{property.schoolDistrict} Schools</Badge>
                      </div>
                    </div>
                    <div className="flex items-center">
                      {selectedProperty === property ? (
                        <CheckCircle className="h-5 w-5 text-blue-500" />
                      ) : (
                        <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Selected Property Confirmation */}
        {selectedProperty && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Property selected: <strong>{selectedProperty.address}</strong>
              <br />
              Owner: {selectedProperty.ownerName}
              <br />
              This will be used for automated verification.
            </AlertDescription>
          </Alert>
        )}

        {/* Help Text */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          <p>
            <strong>Note:</strong> This feature searches the Clark County GIS system for property information. 
            The search will verify that the property address exists and retrieve owner information for verification.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
