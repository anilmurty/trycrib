"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquare, Mail, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface ContactSellerAgentModalProps {
  stayRequest: {
    id: string
    property_id: string
    properties: {
      title: string
      city: string
      state: string
    }
    buyer_profiles: {
      full_name: string | null
      email: string | null
    }
    check_in?: string | null
    check_out?: string | null
  }
  buyerAgentEmail: string
  buyerAgentName: string
  onClose: () => void
  onSuccess: () => void
}

export function ContactSellerAgentModal({
  stayRequest,
  buyerAgentEmail,
  buyerAgentName,
  onClose,
  onSuccess,
}: ContactSellerAgentModalProps) {
  const [loading, setLoading] = useState(false)
  const [sellerAgentEmail, setSellerAgentEmail] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async () => {
    if (!sellerAgentEmail.trim()) {
      toast.error("Please enter the seller's agent email address")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sellerAgentEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!message.trim()) {
      toast.error("Please enter a message")
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/agent/contact-seller-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stay_request_id: stayRequest.id,
          property_id: stayRequest.property_id,
          seller_agent_email: sellerAgentEmail,
          buyer_agent_email: buyerAgentEmail,
          buyer_agent_name: buyerAgentName,
          buyer_name: stayRequest.buyer_profiles.full_name || stayRequest.buyer_profiles.email || "Client",
          buyer_email: stayRequest.buyer_profiles.email || "",
          property_title: stayRequest.properties.title,
          property_location: `${stayRequest.properties.city}, ${stayRequest.properties.state}`,
          check_in: stayRequest.check_in,
          check_out: stayRequest.check_out,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      toast.success("Message sent to seller's agent successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error(`Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Seller's Agent
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-slate-50 p-4 rounded-lg">
            <h3 className="font-semibold text-slate-900 mb-2">{stayRequest.properties.title}</h3>
            <p className="text-sm text-slate-600">
              {stayRequest.properties.city}, {stayRequest.properties.state}
            </p>
            {stayRequest.check_in && stayRequest.check_out && (
              <p className="text-sm text-slate-600 mt-1">
                Requested dates: {new Date(stayRequest.check_in).toLocaleDateString()} - {new Date(stayRequest.check_out).toLocaleDateString()}
              </p>
            )}
            <p className="text-sm text-slate-600 mt-1">
              Client: {stayRequest.buyer_profiles.full_name || stayRequest.buyer_profiles.email}
            </p>
          </div>

          {/* Seller Agent Email */}
          <div className="space-y-2">
            <Label htmlFor="sellerAgentEmail" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Seller's Agent Email Address
            </Label>
            <Input
              id="sellerAgentEmail"
              type="email"
              value={sellerAgentEmail}
              onChange={(e) => setSellerAgentEmail(e.target.value)}
              placeholder="seller.agent@realestate.com"
              required
            />
            <p className="text-xs text-slate-500">
              Enter the email address of the seller's agent for this property
            </p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I'm representing a buyer who is interested in scheduling a stay at this property. Could we coordinate the dates and discuss the details?"
              rows={6}
              required
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-800">What happens next?</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your message will be sent via email to the seller's agent. They will receive all the details about 
                  the stay request and can respond directly to coordinate the stay.
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
              onClick={handleSubmit}
              disabled={loading || !sellerAgentEmail.trim() || !message.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
