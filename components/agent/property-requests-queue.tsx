"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { MapPin, Home, DollarSign, Clock, CheckCircle, XCircle, MessageSquare, User, Mail, Trash2 } from "lucide-react"
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

interface PropertyRequestsQueueProps {
  agentEmail: string
}

export function PropertyRequestsQueue({ agentEmail }: PropertyRequestsQueueProps) {
  const [requests, setRequests] = useState<PropertyListingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<PropertyListingRequest | null>(null)
  const [agentNotes, setAgentNotes] = useState("")
  const [actionLoading, setActionLoading] = useState(false)
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupLoading, setSetupLoading] = useState(false)
  const [setupData, setSetupData] = useState({
    title: "",
    description: "",
    listing_price: 0,
    price_per_night: 0,
    bedrooms: 0,
    bathrooms: 0,
    square_feet: 0,
    property_type: "house",
    year_built: null as number | null,
    lot_size: null as number | null,
    parking_spaces: null as number | null,
    heating_type: null as string | null,
    cooling_type: null as string | null,
    flooring_type: null as string | null,
    roof_type: null as string | null,
    exterior_material: null as string | null,
    foundation_type: null as string | null,
    garage_type: null as string | null,
    pool: false,
    fireplace: false,
    central_air: false,
    hardwood_floors: false,
    updated_kitchen: false,
    updated_bathrooms: false,
    walk_in_closet: false,
    master_suite: false,
    vaulted_ceiling: false,
    skylights: false,
    bay_windows: false,
    crown_molding: false,
    wainscoting: false,
    chair_rail: false,
    built_in_shelving: false,
    custom_cabinets: false,
    granite_countertops: false,
    stainless_steel_appliances: false,
    island: false,
    pantry: false,
    breakfast_nook: false,
    formal_dining: false,
    eat_in_kitchen: false,
    family_room: false,
    living_room: false,
    den: false,
    office: false,
    library: false,
    sunroom: false,
    screened_porch: false,
    deck: false,
    patio: false,
    balcony: false,
    fenced_yard: false,
    garden: false,
    landscaping: false,
    sprinkler_system: false,
    security_system: false,
    smoke_detectors: false,
    carbon_monoxide_detectors: false,
    fire_sprinklers: false,
    gated_community: false,
    homeowners_association: false,
    near_schools: false,
    near_shopping: false,
    near_parks: false,
    near_transit: false,
    quiet_street: false,
    cul_de_sac: false,
    corner_lot: false,
    mountain_view: false,
    water_view: false,
    city_view: false,
    garden_view: false,
    pool_view: false,
    golf_course_view: false,
    other_view: false,
    notes: ""
  })

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
      console.log("Agent email looking for:", agentEmail)
      console.log("All request agent emails:", result.requests?.map((req: PropertyListingRequest) => req.agent_email))
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
          status: 'listing_pending',
          agentNotes: request.agent_notes 
            ? `${request.agent_notes}\n\n--- Agent Response ---\n${agentNotes || 'Request accepted'}`
            : agentNotes || 'Request accepted'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept request')
      }

      toast.success("Request accepted successfully")
      setSelectedRequest(null)
      setAgentNotes("")
      await fetchRequests()
    } catch (error) {
      console.error("Error accepting request:", error)
      toast.error("Failed to accept request")
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
          agentNotes: request.agent_notes 
            ? `${request.agent_notes}\n\n--- Agent Response ---\n${agentNotes || 'Request rejected'}`
            : agentNotes || 'Request rejected'
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

  const handleRemove = async (requestId: string) => {
    if (!confirm("Are you sure you want to remove this listing? This action cannot be undone.")) {
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ requestId })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove listing')
      }

      toast.success("Listing removed")
      await fetchRequests()
    } catch (error) {
      console.error("Error removing listing:", error)
      toast.error("Failed to remove listing")
    } finally {
      setActionLoading(false)
    }
  }

  const handleSetupProperty = async (request: PropertyListingRequest) => {
    setSetupLoading(true)
    
    try {
      // For existing properties, fetch the property data
      if (request.request_type === 'existing_property' && request.property_id) {
        try {
          const response = await fetch(`/api/properties/${request.property_id}`)
          if (response.ok) {
            const result = await response.json()
            const propertyData = result.property || result
            console.log("Fetched property data:", propertyData)
            setSetupData({
              ...setupData,
              title: propertyData.title || request.property_address,
              description: propertyData.description || '',
              listing_price: propertyData.listing_price || 0,
              price_per_night: propertyData.price_per_night || 0,
              bedrooms: propertyData.bedrooms || 0,
              bathrooms: propertyData.bathrooms || 0,
              square_feet: propertyData.square_feet || 0,
              property_type: propertyData.property_type || 'house',
              year_built: propertyData.year_built || null,
              lot_size: propertyData.lot_size || null
            })
          } else {
            // Fallback to basic data if property fetch fails
            setSetupData({
              ...setupData,
              title: request.property_address,
              description: '',
              listing_price: 0,
              price_per_night: 0,
              bedrooms: 0,
              bathrooms: 0,
              square_feet: 0,
              property_type: 'house'
            })
          }
        } catch (error) {
          console.error('Error fetching property data:', error)
          // Fallback to basic data
          setSetupData({
            ...setupData,
            title: request.property_address,
            description: '',
            listing_price: 0,
            price_per_night: 0,
            bedrooms: 0,
            bathrooms: 0,
            square_feet: 0,
            property_type: 'house'
          })
        }
      } else {
        // For new properties, use basic data
        setSetupData({
          ...setupData,
          title: request.property_address,
          description: '',
          listing_price: 0,
          price_per_night: 0,
          bedrooms: 0,
          bathrooms: 0,
          square_feet: 0,
          property_type: 'house'
        })
      }
    } finally {
      setSetupLoading(false)
      // Set selected request and open modal after data is loaded
      setSelectedRequest(request)
      setShowSetupModal(true)
    }
  }

  const handleSubmitSetup = async () => {
    if (!selectedRequest) return

    setActionLoading(true)
    try {
      const response = await fetch('/api/property-listing-requests', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: selectedRequest.id,
          propertySetupData: setupData,
          agentNotes: agentNotes || "Property setup completed"
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to complete property setup')
      }

      toast.success("Property setup completed and sent to seller for approval")
      setShowSetupModal(false)
      setSelectedRequest(null)
      setAgentNotes("")
      await fetchRequests()
    } catch (error) {
      console.error("Error completing property setup:", error)
      toast.error("Failed to complete property setup")
    } finally {
      setActionLoading(false)
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
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><Clock className="h-4 w-4 mr-2" />Awaiting Seller Approval</Badge>
      case 'rejected':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1"><XCircle className="h-4 w-4 mr-2" />Rejected</Badge>
      case 'listed':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1"><CheckCircle className="h-4 w-4 mr-2" />Listed</Badge>
      default:
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-sm font-medium px-3 py-1">{status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Badge>
    }
  }

  const pendingRequests = requests.filter(r => r.status === 'listing_requested' || r.status === 'pending' || r.status === 'listing_pending' || r.status === 'approval_pending')
  const approvedRequests = requests.filter(r => r.status === 'approval_pending')
  const otherRequests = requests.filter(r => r.status !== 'listing_requested' && r.status !== 'listing_pending' && r.status !== 'pending' && r.status !== 'approval_pending')
  
  console.log("All requests:", requests)
  console.log("Pending requests:", pendingRequests)
  console.log("Approved requests:", approvedRequests)

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
          <h3 className="text-lg font-semibold text-slate-900">Property Requests</h3>
        </div>

        {pendingRequests.length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-slate-600">
                <Clock className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-semibold mb-2">No property requests</h3>
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
                      {/* Show per-night price if setup is completed */}
                      {request.status === 'approval_pending' && request.property_setup_data?.price_per_night && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                          <DollarSign className="h-4 w-4 text-slate-600" />
                          <span>Price per Night: <span className="font-semibold text-slate-900">${request.property_setup_data.price_per_night.toLocaleString()}</span></span>
                        </div>
                      )}
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

                    {/* Show conversation history */}
                    {(request.agent_notes || request.message) && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="h-4 w-4 text-blue-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-blue-900 mb-2">Conversation with Seller:</p>
                            <div className="max-h-32 overflow-y-auto space-y-3 pr-2">
                              {/* Show original seller message first */}
                              {request.message && (
                                <div className="text-sm">
                                  <div className="font-medium text-slate-700">
                                    Seller: <span className="text-slate-500 text-xs">[{new Date(request.created_at).toLocaleString()}]</span>
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
                                      {isChangeRequest ? 'Seller' : 'You'}: <span className="text-slate-500 text-xs">[{timestamp}]</span>
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


                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={async () => {
                          if (request.status === 'listing_pending') {
                            await handleSetupProperty(request)
                          } else if (request.status === 'approval_pending') {
                            // For approval_pending, show property setup details
                            setSelectedRequest(request)
                            // Populate setup data with existing property setup data
                            if (request.property_setup_data) {
                              setSetupData(prev => ({
                                ...prev,
                                title: request.property_setup_data.title || request.property_address,
                                description: request.property_setup_data.description || '',
                                listing_price: request.property_setup_data.listing_price || 0,
                                price_per_night: request.property_setup_data.price_per_night || 0,
                                bedrooms: request.property_setup_data.bedrooms || 0,
                                bathrooms: request.property_setup_data.bathrooms || 0,
                                square_feet: request.property_setup_data.square_feet || 0,
                                property_type: request.property_setup_data.property_type || 'house',
                                year_built: request.property_setup_data.year_built || null,
                                lot_size: request.property_setup_data.lot_size || null,
                                notes: request.property_setup_data.notes || ''
                              }))
                            }
                            setShowSetupModal(true)
                          } else {
                            setSelectedRequest(request)
                          }
                        }}
                        disabled={setupLoading}
                        className="flex-1"
                      >
                        {setupLoading ? 'Loading...' : 
                          request.status === 'listing_pending' ? 'Setup Property' : 
                          request.status === 'approval_pending' ? 'View Details' : 
                          'Review Request'}
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
                {request.status === 'listed' && (
                  <CardContent className="pt-0">
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(request.id)}
                        disabled={actionLoading}
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {actionLoading ? "Removing..." : "Remove Listing"}
                      </Button>
                    </div>
                  </CardContent>
                )}
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
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                >
                  {actionLoading ? "Accepting..." : "Accept"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Property Setup Modal */}
      {showSetupModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl bg-white max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedRequest.status === 'approval_pending' ? 'Property Setup Details' : 'Setup Property Listing'}
              </CardTitle>
              <p className="text-sm text-slate-600">
                {selectedRequest.property_address}, {selectedRequest.property_city}, {selectedRequest.property_state}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title" className="mb-2 block">Property Title</Label>
                  <Input
                    id="title"
                    value={setupData.title}
                    onChange={(e) => setSetupData({...setupData, title: e.target.value})}
                    placeholder="Enter property title"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="property_type" className="mb-2 block">Property Type</Label>
                  <select
                    id="property_type"
                    value={setupData.property_type}
                    onChange={(e) => setSetupData({...setupData, property_type: e.target.value})}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md ${selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}`}
                    disabled={selectedRequest.status === 'approval_pending'}
                  >
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="townhouse">Townhouse</option>
                    <option value="apartment">Apartment</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="listing_price" className="mb-2 block">Listing Price ($)</Label>
                  <Input
                    id="listing_price"
                    type="number"
                    value={setupData.listing_price}
                    onChange={(e) => setSetupData({...setupData, listing_price: parseInt(e.target.value) || 0})}
                    placeholder="Enter listing price"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="bedrooms" className="mb-2 block">Bedrooms</Label>
                  <Input
                    id="bedrooms"
                    type="number"
                    value={setupData.bedrooms}
                    onChange={(e) => setSetupData({...setupData, bedrooms: parseInt(e.target.value) || 0})}
                    placeholder="Number of bedrooms"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="bathrooms" className="mb-2 block">Bathrooms</Label>
                  <Input
                    id="bathrooms"
                    type="number"
                    step="0.5"
                    value={setupData.bathrooms}
                    onChange={(e) => setSetupData({...setupData, bathrooms: parseFloat(e.target.value) || 0})}
                    placeholder="Number of bathrooms"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="square_feet" className="mb-2 block">Square Feet</Label>
                  <Input
                    id="square_feet"
                    type="number"
                    value={setupData.square_feet}
                    onChange={(e) => setSetupData({...setupData, square_feet: parseInt(e.target.value) || 0})}
                    placeholder="Square footage"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="year_built" className="mb-2 block">Year Built</Label>
                  <Input
                    id="year_built"
                    type="number"
                    value={setupData.year_built || ""}
                    onChange={(e) => setSetupData({...setupData, year_built: parseInt(e.target.value) || null})}
                    placeholder="Year built"
                    readOnly={selectedRequest.status === 'approval_pending'}
                    className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="mb-2 block">Property Description</Label>
                <Textarea
                  id="description"
                  value={setupData.description}
                  onChange={(e) => setSetupData({...setupData, description: e.target.value})}
                  placeholder="Describe the property..."
                  rows={4}
                  readOnly={selectedRequest.status === 'approval_pending'}
                  className={selectedRequest.status === 'approval_pending' ? 'bg-gray-50' : ''}
                />
              </div>

              {/* Prominent Price per Night Field */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <Label htmlFor="price_per_night" className="mb-2 block text-orange-800 font-semibold">
                  ⭐ Price per Night ($) - Required
                </Label>
                <Input
                  id="price_per_night"
                  type="number"
                  value={setupData.price_per_night}
                  onChange={(e) => setSetupData({...setupData, price_per_night: parseInt(e.target.value) || 0})}
                  placeholder="Enter price per night"
                  className="text-lg font-medium"
                />
                <p className="text-sm text-orange-700 mt-1">This is the most important field - set the nightly rental price for this property.</p>
              </div>

              <div>
                <Label htmlFor="agent-notes" className="mb-2 block">Notes for Seller</Label>
                <Textarea
                  id="agent-notes"
                  value={agentNotes}
                  onChange={(e) => setAgentNotes(e.target.value)}
                  placeholder="Add any notes for the seller..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowSetupModal(false)
                    setSelectedRequest(null)
                    setAgentNotes("")
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmitSetup}
                  disabled={actionLoading || !setupData.title || !setupData.listing_price || !setupData.price_per_night || setupData.price_per_night <= 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {actionLoading ? "Setting up..." : "Complete Setup & Send to Seller"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
