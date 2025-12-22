"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

interface BuyerListingRequest {
  id: string
  property_address: string
  status: string
  created_at: string
}

interface AddressForm {
  id: string
  address: string
  isSubmitting: boolean
  error: string | null
}

export function BuyerListingRequests() {
  const [savedRequests, setSavedRequests] = useState<BuyerListingRequest[]>([])
  const [addressForms, setAddressForms] = useState<AddressForm[]>([
    { id: crypto.randomUUID(), address: "", isSubmitting: false, error: null }
  ])
  const [loading, setLoading] = useState(true)

  // Fetch existing requests
  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch("/api/buyer-listing-requests")
        if (response.ok) {
          const { data } = await response.json()
          setSavedRequests(data || [])
        }
      } catch (error) {
        console.error("Error fetching requests:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchRequests()
  }, [])

  const addNewForm = () => {
    setAddressForms([
      ...addressForms,
      { id: crypto.randomUUID(), address: "", isSubmitting: false, error: null }
    ])
  }

  const updateFormAddress = (formId: string, address: string) => {
    setAddressForms(forms =>
      forms.map(form =>
        form.id === formId
          ? { ...form, address, error: null }
          : form
      )
    )
  }

  const removeForm = (formId: string) => {
    setAddressForms(forms => {
      const filtered = forms.filter(form => form.id !== formId)
      // Always keep at least one form
      return filtered.length > 0 ? filtered : [{ id: crypto.randomUUID(), address: "", isSubmitting: false, error: null }]
    })
  }

  const validateAddress = (address: string): string | null => {
    const trimmed = address.trim()
    if (!trimmed) {
      return "Address is required"
    }
    if (trimmed.length < 5) {
      return "Please enter a valid address"
    }
    return null
  }

  const submitForm = async (formId: string) => {
    const form = addressForms.find(f => f.id === formId)
    if (!form) return

    const error = validateAddress(form.address)
    if (error) {
      setAddressForms(forms =>
        forms.map(f =>
          f.id === formId ? { ...f, error } : f
        )
      )
      return
    }

    // Set submitting state
    setAddressForms(forms =>
      forms.map(f =>
        f.id === formId ? { ...f, isSubmitting: true, error: null } : f
      )
    )

    try {
      const response = await fetch("/api/buyer-listing-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          property_address: form.address.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save address")
      }

      // Add to saved requests
      setSavedRequests(prev => [data.data, ...prev])

      // Remove the form or clear it
      setAddressForms(forms =>
        forms.map(f =>
          f.id === formId
            ? { id: crypto.randomUUID(), address: "", isSubmitting: false, error: null }
            : f
        )
      )

      toast.success("Address saved", {
        description: "Your request has been submitted successfully.",
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save address"
      setAddressForms(forms =>
        forms.map(f =>
          f.id === formId
            ? { ...f, isSubmitting: false, error: errorMessage }
            : f
        )
      )
      toast.error("Error", {
        description: errorMessage,
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      pending: "secondary",
      contacted: "default",
      listed: "default",
      rejected: "outline",
    }
    return (
      <Badge variant={variants[status] || "secondary"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <p className="text-slate-600 mt-2">
        Thanks for signing up. We're currently working with agents in your area to onboard homes. 
        Please take a minute to tell us which homes you want listed on this platform.
      </p>

      {/* Address Forms */}
      <div className="space-y-4">
        {addressForms.map((form, index) => (
          <Card key={form.id} className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    placeholder={`Enter property address ${addressForms.length > 1 ? `#${index + 1}` : ""}`}
                    value={form.address}
                    onChange={(e) => updateFormAddress(form.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        submitForm(form.id)
                      }
                    }}
                    disabled={form.isSubmitting}
                    className={form.error ? "border-red-500" : ""}
                  />
                  {form.error && (
                    <p className="text-sm text-red-500 mt-1">{form.error}</p>
                  )}
                </div>
                <Button
                  onClick={() => submitForm(form.id)}
                  disabled={form.isSubmitting || !form.address.trim()}
                  className="whitespace-nowrap"
                >
                  {form.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                {addressForms.length > 1 && (
                  <Button
                    onClick={() => removeForm(form.id)}
                    variant="outline"
                    disabled={form.isSubmitting}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add More Button */}
        <Button
          onClick={addNewForm}
          variant="outline"
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Another Address
        </Button>
      </div>

      {/* Saved Requests */}
      {!loading && savedRequests.length > 0 && (
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Your Submitted Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {savedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-slate-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{request.property_address}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      Submitted {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="ml-4">
                    {getStatusBadge(request.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
