"use client"

import { useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { X, MapPin, CheckCircle } from "lucide-react"
import { toast } from "sonner"

export function ListingRequestBanner() {
  const { isSignedIn, isLoaded, user } = useUser()
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [address, setAddress] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleRequestClick = () => {
    if (!isLoaded) return
    
    if (!isSignedIn) {
      router.push("/auth?tab=signup")
      return
    }

    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!address.trim()) {
      toast.error("Please enter a property address")
      return
    }

    if (!user?.id) {
      toast.error("You must be logged in to submit a request")
      router.push("/auth?tab=signup")
      return
    }

    setSubmitting(true)

    try {
      const response = await fetch("/api/buyer-listing-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_address: address.trim(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit request")
      }

      // Show confirmation instead of toast
      setShowForm(false)
      setShowConfirmation(true)
      setAddress("")
    } catch (error: any) {
      console.error("Error:", error)
      toast.error(error.message || "An error occurred. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleRequestAnother = () => {
    setShowConfirmation(false)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowConfirmation(false)
  }

  if (!isLoaded) {
    return null
  }

  if (showConfirmation) {
    return (
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-slate-900 font-medium mb-2">
                Thanks for the request. Our team will reach out to the listing agent for this property and notify you once it's up!
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={handleRequestAnother}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Request Another Home
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (showForm) {
    return (
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Request a Property Listing
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowForm(false)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Enter property address (e.g., 123 Main St, City, State)"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="pl-10"
                required
                disabled={submitting}
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false)
                  setAddress("")
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <p className="text-slate-600">
          Is the home not listed?
        </p>
        <Button
          onClick={handleRequestClick}
          className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
        >
          Request Listing
        </Button>
      </div>
    </div>
  )
}
