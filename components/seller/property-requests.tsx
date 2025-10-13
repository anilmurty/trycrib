"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Home, DollarSign, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react"
import { format } from "date-fns"

interface PropertyListingRequest {
  id: string
  seller_id: string
  agent_email: string
  property_id: string | null
  request_type: 'existing_property' | 'new_property'
  property_address: string
  property_city: string
  property_state: string
  property_zip: string
  message: string | null
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  agent_notes: string | null
  created_at: string
  updated_at: string
}

interface PropertyRequestsProps {
  userId: string
}

export function PropertyRequests({ userId }: PropertyRequestsProps) {
  const [requests, setRequests] = useState<PropertyListingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchRequests()
  }, [userId])

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("property_listing_requests")
        .select("*")
        .eq("seller_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching requests:", error)
        return
      }

      setRequests(data || [])
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>
      case 'completed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Listed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'pending':
        return "Waiting for your agent to review and respond"
      case 'approved':
        return "Your agent has approved this request and is working on it"
      case 'rejected':
        return "Your agent has declined this request"
      case 'completed':
        return "This property has been successfully added to TryCrib listings"
      default:
        return ""
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-600">Loading your requests...</div>
        </CardContent>
      </Card>
    )
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-600">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold mb-2">No requests yet</h3>
            <p className="text-sm">When you request properties to be listed, they'll appear here.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">My Property Requests</h3>
        <Badge variant="outline">{requests.length} total</Badge>
      </div>

      {requests.map((request) => (
        <Card key={request.id} className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-slate-600" />
                  {request.property_address}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  {request.property_city}, {request.property_state} {request.property_zip}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {getStatusBadge(request.status)}
                <span className="text-xs text-slate-500">
                  {format(new Date(request.created_at), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Home className="h-4 w-4 text-slate-600" />
                <span className="text-slate-600">
                  {request.request_type === 'existing_property' ? 'Existing property' : 'New property'}
                </span>
              </div>

              <div className="text-sm text-slate-600">
                <strong>Status:</strong> {getStatusDescription(request.status)}
              </div>

              {request.message && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-1">Your message:</p>
                      <p className="text-sm text-slate-700">{request.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {request.agent_notes && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 mb-1">Agent notes:</p>
                      <p className="text-sm text-blue-700">{request.agent_notes}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Requested to: {request.agent_email}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
