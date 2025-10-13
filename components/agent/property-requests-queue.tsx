"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { MapPin, Home, DollarSign, Clock, CheckCircle, XCircle, MessageSquare, User, Mail } from "lucide-react"
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

interface PropertyRequestsQueueProps {
  agentEmail: string
}

export function PropertyRequestsQueue({ agentEmail }: PropertyRequestsQueueProps) {
  const [requests, setRequests] = useState<PropertyListingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PropertyListingRequest | null>(null)
  const [agentNotes, setAgentNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchRequests()
  }, [agentEmail])

  // Refresh requests every 30 seconds to catch withdrawals and removals
  useEffect(() => {
    const interval = setInterval(fetchRequests, 30000)
    return () => clearInterval(interval)
  }, [agentEmail])

  const fetchRequests = async () => {
    try {
      console.log("Fetching requests for agent email:", agentEmail)
      
      // Use API route to fetch requests (bypasses RLS)
      const response = await fetch('/api/property-listing-requests')
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      
      const result = await response.json()
      console.log("All requests from API:", result.requests)
      
      // Filter requests for this specific agent
      const agentRequests = result.requests?.filter((req: PropertyListingRequest) => req.agent_email === agentEmail) || []
      console.log("Filtered requests for agent:", agentRequests)
      setRequests(agentRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (request: PropertyListingRequest) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          status: 'approved',
          agentNotes: agentNotes || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve request')
      }

      toast.success("Request approved successfully")
      setSelectedRequest(null)
      setAgentNotes("")
      await fetchRequests()
    } catch (error) {
      console.error("Error approving request:", error)
      toast.error("Failed to approve request")
    } finally {
      setActionLoading(false)
    }
  }

  const handleReject = async (request: PropertyListingRequest) => {
    setActionLoading(true)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: request.id,
          status: 'rejected',
          agentNotes: agentNotes || null
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to reject request')
      }

      toast.success("Request rejected")
      setSelectedRequest(null)
      setAgentNotes("")
      await fetchRequests()
    } catch (error) {
      console.error("Error rejecting request:", error)
      toast.error("Failed to reject request")
    } finally {
      setActionLoading(false)
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
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')
  const otherRequests = requests.filter(r => r.status !== 'pending')

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-slate-600">Loading requests...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Pending Requests */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Pending Requests</h3>
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
            {pendingRequests.length} pending
          </Badge>
        </div>

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-slate-600">
                <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">No pending requests</h3>
                <p className="text-sm">New property requests from sellers will appear here.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-yellow-500">
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

                    {request.message && (
                      <div className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-slate-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-slate-900 mb-1">Seller message:</p>
                            <p className="text-sm text-slate-700">{request.message}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request)}
                        className="flex-1"
                      >
                        Review Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Other Requests */}
      {otherRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Requests</h3>
          <div className="space-y-3">
            {otherRequests.map((request) => (
              <Card key={request.id} className="border-l-4 border-l-slate-300">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-slate-600" />
                        {request.property_address}
                      </CardTitle>
                      <p className="text-xs text-slate-600 mt-1">
                        {request.property_city}, {request.property_state} {request.property_zip}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(request.status)}
                      <span className="text-xs text-slate-500">
                        {format(new Date(request.created_at), 'MMM d')}
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Action Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Review Property Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-slate-900">{selectedRequest.property_address}</h4>
                <p className="text-sm text-slate-600">
                  {selectedRequest.property_city}, {selectedRequest.property_state} {selectedRequest.property_zip}
                </p>
              </div>

              {selectedRequest.message && (
                <div className="bg-slate-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-slate-900 mb-1">Seller message:</p>
                  <p className="text-sm text-slate-700">{selectedRequest.message}</p>
                </div>
              )}

              <div>
                <Label htmlFor="agent-notes">Your notes (optional)</Label>
                <Textarea
                  id="agent-notes"
                  placeholder="Add notes about this request..."
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null)
                    setAgentNotes("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedRequest)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={actionLoading}
                  className="flex-1"
                >
                  {actionLoading ? "Approving..." : "Approve"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
