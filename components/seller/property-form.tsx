"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PropertyFormProps {
  userId: string
  property?: {
    id: string
    title: string
    description: string | null
    address: string
    city: string
    state: string
    zip_code: string
    bedrooms: number | null
    bathrooms: number | null
    square_feet: number | null
    price_per_night: number
    listing_price: number | null
    amenities: string[] | null
  }
}

export function PropertyForm({ userId, property }: PropertyFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: property?.title || "",
    description: property?.description || "",
    address: property?.address || "",
    city: property?.city || "",
    state: property?.state || "",
    zip_code: property?.zip_code || "",
    bedrooms: property?.bedrooms?.toString() || "",
    bathrooms: property?.bathrooms?.toString() || "",
    square_feet: property?.square_feet?.toString() || "",
    price_per_night: property?.price_per_night?.toString() || "",
    listing_price: property?.listing_price?.toString() || "",
    amenities: property?.amenities?.join(", ") || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const propertyData = {
        seller_id: userId,
        title: formData.title,
        description: formData.description || null,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        bedrooms: formData.bedrooms ? Number.parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? Number.parseFloat(formData.bathrooms) : null,
        square_feet: formData.square_feet ? Number.parseInt(formData.square_feet) : null,
        price_per_night: Number.parseFloat(formData.price_per_night),
        listing_price: formData.listing_price ? Number.parseFloat(formData.listing_price) : null,
        amenities: formData.amenities
          ? formData.amenities
              .split(",")
              .map((a) => a.trim())
              .filter((a) => a)
          : null,
        is_active: true,
        verification_status: "pending",
      }

      if (property) {
        const { error } = await supabase.from("properties").update(propertyData).eq("id", property.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("properties").insert([propertyData])
        if (error) throw error
      }

      router.push("/dashboard/seller")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div>
      <Link
        href="/dashboard/seller"
        className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Link>

      <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
        <CardHeader>
          <CardTitle>{property ? "Edit Property" : "Add New Property"}</CardTitle>
          <CardDescription>Fill in the details about your property</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Property Title *</Label>
                <Input
                  id="title"
                  required
                  placeholder="Beautiful 3BR Home in Downtown"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your property..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="address">Street Address *</Label>
                  <Input
                    id="address"
                    required
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    required
                    placeholder="San Francisco"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    required
                    placeholder="CA"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="zip_code">ZIP Code *</Label>
                  <Input
                    id="zip_code"
                    required
                    placeholder="94102"
                    value={formData.zip_code}
                    onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="bedrooms">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    min="0"
                    placeholder="3"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder="2"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="square_feet">Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    min="0"
                    placeholder="1500"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="price_per_night">Price Per Night *</Label>
                  <Input
                    id="price_per_night"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    placeholder="150"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="listing_price">Listing Price</Label>
                  <Input
                    id="listing_price"
                    type="number"
                    min="0"
                    placeholder="500000"
                    value={formData.listing_price}
                    onChange={(e) => setFormData({ ...formData, listing_price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="amenities">Amenities (comma-separated)</Label>
                <Input
                  id="amenities"
                  placeholder="WiFi, Parking, Pool, Gym"
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Saving..." : property ? "Update Property" : "Create Property"}
              </Button>
              <Link href="/dashboard/seller" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
