"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MapPin, Home, DollarSign, MessageSquare, AlertCircle, Calendar } from "lucide-react"
import { toast } from "sonner"

interface Property {
  id: string
  title: string
  address: string
  city: string
  state: string
  zip_code: string
  listing_price: number | null
}

interface StayRequestModalProps {
  property: Property
  userId: string
  onClose: () => void
  onSuccess: () => void
}

export function StayRequestModal({ 
  property, 
  userId, 
  onClose, 
  onSuccess 
}: StayRequestModalProps) {
  const [loading, setLoading] = useState(false)
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmitRequest = async () => {
    setLoading(true)
    try {
      const requestData = {
        buyer_id: userId,
        property_id: property.id,
        check_in: checkIn || null,
        check_out: checkOut || null,
        message: message || null,
      }

      console.log("Sending stay request with data:", requestData)

      const response = await fetch('/api/stay-requests', {
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
      console.log("Stay request sent successfully:", result)
      toast.success("Stay request sent to your agent successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error sending stay request:", error)
      toast.error(`Failed to send request: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0]

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Request Stay
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">{property.title}</h3>
            <div className="flex items-center gap-1 text-sm text-slate-600 mb-2">
              <MapPin className="h-4 w-4" />
              {property.address}, {property.city}, {property.state} {property.zip_code}
            </div>
            {property.listing_price && (
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <DollarSign className="h-4 w-4" />
                Listed at ${property.listing_price.toLocaleString()}
              </div>
            )}
          </div>

          {/* Date Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkIn" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-in Date (Optional)
              </Label>
              <Input
                id="checkIn"
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={today}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="checkOut" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Check-out Date (Optional)
              </Label>
              <Input
                id="checkOut"
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || today}
              />
            </div>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message to Your Agent (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell your agent why you're interested in this property or any specific questions..."
              rows={4}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">Request Process</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your stay request will be sent to your assigned agent. They will coordinate with 
                  the seller's agent to arrange your stay at this property.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitRequest}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
