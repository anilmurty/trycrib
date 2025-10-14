"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Home, DollarSign, Clock, CheckCircle, XCircle, MessageSquare, X, Trash2, Eye, Edit } from "lucide-react"
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
  status: 'listing_requested' | 'listing_pending' | 'rejected' | 'listed' | 'approval_pending' | 'pending'
  agent_notes: string | null
  property_setup_data: any | null
  setup_completed_at: string | null
  seller_approved_at: string | null
  created_at: string
  updated_at: string
}

interface PropertyRequestsProps {
  userId: string
}

export function PropertyRequests({ userId }: PropertyRequestsProps) {
  const [requests, setRequests] = useState<PropertyListingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [approving, setApproving] = useState<string | null>(null)
  const [requestingChanges, setRequestingChanges] = useState<string | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<PropertyListingRequest | null>(null)
  const [showChangesModal, setShowChangesModal] = useState(false)
  const [changeRequest, setChangeRequest] = useState("")

  useEffect(() => {
    fetchRequests()
  }, [userId])

  const fetchRequests = async () => {
    try {
      console.log("Fetching requests for userId:", userId)
      
      // Use API route to fetch requests (bypasses RLS)
      const response = await fetch('/api/property-listing-requests')
      
      if (!response.ok) {
        throw new Error('Failed to fetch requests')
      }
      
      const result = await response.json()
      console.log("All requests from API:", result.requests)
      
      // Filter requests for this specific seller
      const sellerRequests = result.requests?.filter((req: PropertyListingRequest) => req.seller_id === userId) || []
      console.log("Filtered requests for seller:", sellerRequests)
      setRequests(sellerRequests)
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async (requestId: string) => {
    if (!confirm("Are you sure you want to withdraw this request? This action cannot be undone.")) {
      return
    }

    setWithdrawing(requestId)
    try {
      const response = await fetch(`/api/property-listing-requests?id=${requestId}&action=withdraw`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to withdraw request')
      }

      // Remove the request from local state
      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error("Error withdrawing request:", error)
      alert("Failed to withdraw request. Please try again.")
    } finally {
      setWithdrawing(null)
    }
  }

  const handleRemove = async (requestId: string) => {
    if (!confirm("Are you sure you want to remove this approved request? This action cannot be undone.")) {
      return
    }

    setRemoving(requestId)
    try {
      const response = await fetch(`/api/property-listing-requests?id=${requestId}&action=remove`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove request')
      }

      // Remove the request from local state
      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (error) {
      console.error("Error removing request:", error)
      alert("Failed to remove request. Please try again.")
    } finally {
      setRemoving(null)
    }
  }

  const handleApprove = async (requestId: string) => {
    if (!confirm("Are you sure you want to approve this property listing? It will go live on TryCrib.")) {
      return
    }

    setApproving(requestId)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          status: 'listed'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to approve request')
      }

      // Update the request status in local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'listed' as const, seller_approved_at: new Date().toISOString() }
          : req
      ))
    } catch (error) {
      console.error("Error approving request:", error)
      alert("Failed to approve request. Please try again.")
    } finally {
      setApproving(null)
    }
  }

  const handleViewDetails = (request: PropertyListingRequest) => {
    setSelectedRequest(request)
    setShowDetailsModal(true)
  }

  const handleRequestChanges = (requestId: string) => {
    setSelectedRequest(requests.find(r => r.id === requestId) || null)
    setChangeRequest("")
    setShowChangesModal(true)
  }

  const handleSubmitChangeRequest = async () => {
    if (!selectedRequest || !changeRequest.trim()) {
      alert("Please enter your change request.")
      return
    }

    setRequestingChanges(selectedRequest.id)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          status: 'listing_pending', // Move back to listing_pending for agent to make changes
          agentNotes: selectedRequest.agent_notes 
            ? `${selectedRequest.agent_notes}\n\n--- Seller Change Request ---\n${changeRequest}`
            : changeRequest
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to request changes')
      }

      // Update the request status in local state
      const updatedNotes = selectedRequest.agent_notes 
        ? `${selectedRequest.agent_notes}\n\n--- Seller Change Request ---\n${changeRequest}`
        : changeRequest
      
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? { ...req, status: 'listing_pending' as const, agent_notes: updatedNotes }
          : req
      ))

      setShowChangesModal(false)
      setSelectedRequest(null)
      setChangeRequest("")
      alert("Change request sent to your agent.")
    } catch (error) {
      console.error("Error requesting changes:", error)
      alert("Failed to request changes. Please try again.")
    } finally {
      setRequestingChanges(null)
    }
  }

         const getStatusBadge = (status: string) => {
           switch (status) {
             case 'listing_requested':
             case 'pending':
               return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><Clock className="h-4 w-4 mr-2" />Listing Requested</Badge>
             case 'listing_pending':
               return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><CheckCircle className="h-4 w-4 mr-2" />Listing Pending</Badge>
             case 'approval_pending':
               return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><Clock className="h-4 w-4 mr-2" />Awaiting Your Approval</Badge>
             case 'rejected':
               return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><XCircle className="h-4 w-4 mr-2" />Rejected</Badge>
             case 'listed':
               return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1"><CheckCircle className="h-4 w-4 mr-2" />Listed</Badge>
             default:
               return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1">{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
           }
         }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case 'listing_requested':
      case 'pending':
        return "Waiting for your agent to review and respond"
      case 'listing_pending':
        return "Your agent has approved this request and is working on it"
      case 'approval_pending':
        return "Your agent has set up the listing details. Please review and approve to make it live."
      case 'rejected':
        return "Your agent has declined this request"
      case 'listed':
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

              <div className="text-sm text-slate-600">
                <strong>Status:</strong> {getStatusDescription(request.status)}
              </div>


              {(request.agent_notes || request.message) && (
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900 mb-2">Conversation with Agent:</p>
                      <div className="max-h-32 overflow-y-auto space-y-3 pr-2">
                        {/* Show original seller message first */}
                        {request.message && (
                          <div className="text-sm">
                            <div className="font-medium text-slate-700">
                              You: <span className="text-slate-500 text-xs">[{new Date(request.created_at).toLocaleString()}]</span>
                            </div>
                            <div className="text-slate-600 mt-1 whitespace-pre-wrap">{request.message}</div>
                          </div>
                        )}
                        
                        {/* Show agent notes and change requests */}
                        {request.agent_notes && request.agent_notes.split(/\n\n--- (?:Seller Change Request|Agent Response) ---\n/).map((message, index) => {
                          const isChangeRequest = request.agent_notes.includes('--- Seller Change Request ---') && 
                            request.agent_notes.indexOf('--- Seller Change Request ---') < request.agent_notes.indexOf(message)
                          const timestamp = new Date(request.updated_at).toLocaleString()
                          return (
                            <div key={index} className="text-sm">
                              <div className="font-medium text-slate-700">
                                {isChangeRequest ? 'You' : 'Listing Agent'}: <span className="text-slate-500 text-xs">[{timestamp}]</span>
                              </div>
                              <div className="text-slate-600 mt-1 whitespace-pre-wrap">{message}</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-500">
                Requested to: {request.agent_email}
              </div>

                     {(request.status === 'listing_requested' || request.status === 'listing_pending' || request.status === 'approval_pending' || request.status === 'pending' || request.status === 'listed') && (
                <div className="pt-3 border-t border-slate-200">
                  {(request.status === 'listing_requested' || request.status === 'pending' || request.status === 'listing_pending') ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleWithdraw(request.id)}
                      disabled={withdrawing === request.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <X className="h-4 w-4 mr-2" />
                      {withdrawing === request.id ? "Withdrawing..." : "Withdraw Request"}
                    </Button>
                  ) : request.status === 'approval_pending' ? (
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRequestChanges(request.id)}
                        disabled={requestingChanges === request.id}
                        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        {requestingChanges === request.id ? "Requesting..." : "Request Changes"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                        disabled={approving === request.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {approving === request.id ? "Approving..." : "Approve Listing"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleWithdraw(request.id)}
                        disabled={withdrawing === request.id}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {withdrawing === request.id ? "Withdrawing..." : "Withdraw Request"}
                      </Button>
                    </div>
                  ) : request.status === 'listed' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(request.id)}
                      disabled={removing === request.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {removing === request.id ? "Removing..." : "Remove Listing"}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemove(request.id)}
                      disabled={removing === request.id}
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {removing === request.id ? "Removing..." : "Remove Request"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg">Property Listing Details</CardTitle>
              <p className="text-sm text-slate-600">
                {selectedRequest.property_address}, {selectedRequest.property_city}, {selectedRequest.property_state}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {selectedRequest.property_setup_data && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block font-semibold">Property Title</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        {selectedRequest.property_setup_data.title || selectedRequest.property_address}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Property Type</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded capitalize">
                        {selectedRequest.property_setup_data.property_type || 'house'}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Listing Price</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        ${selectedRequest.property_setup_data.listing_price?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Price per Night</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded font-semibold text-green-700">
                        ${selectedRequest.property_setup_data.price_per_night?.toLocaleString() || '0'}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Bedrooms</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        {selectedRequest.property_setup_data.bedrooms || '0'}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Bathrooms</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        {selectedRequest.property_setup_data.bathrooms || '0'}
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Square Feet</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        {selectedRequest.property_setup_data.square_feet?.toLocaleString() || '0'} sq ft
                      </p>
                    </div>
                    <div>
                      <Label className="mb-2 block font-semibold">Year Built</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-2 rounded">
                        {selectedRequest.property_setup_data.year_built || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  {selectedRequest.property_setup_data.description && (
                    <div>
                      <Label className="mb-2 block font-semibold">Property Description</Label>
                      <p className="text-sm text-slate-700 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                        {selectedRequest.property_setup_data.description}
                      </p>
                    </div>
                  )}

                  {selectedRequest.agent_notes && (
                    <div>
                      <Label className="mb-2 block font-semibold">Agent Notes</Label>
                      <p className="text-sm text-slate-700 bg-blue-50 p-3 rounded border border-blue-200">
                        {selectedRequest.agent_notes}
                      </p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowDetailsModal(false)
                    setSelectedRequest(null)
                  }}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Request Changes Modal */}
      {showChangesModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md bg-white">
            <CardHeader>
              <CardTitle className="text-lg">Request Changes</CardTitle>
              <p className="text-sm text-slate-600">
                {selectedRequest.property_address}, {selectedRequest.property_city}, {selectedRequest.property_state}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="change-request" className="mb-2 block">What changes would you like to request?</Label>
                <textarea
                  id="change-request"
                  value={changeRequest}
                  onChange={(e) => setChangeRequest(e.target.value)}
                  placeholder="Please describe the changes you'd like your agent to make..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={4}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowChangesModal(false)
                    setSelectedRequest(null)
                    setChangeRequest("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitChangeRequest}
                  disabled={requestingChanges === selectedRequest.id || !changeRequest.trim()}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {requestingChanges === selectedRequest.id ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
