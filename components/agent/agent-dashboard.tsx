"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Home, MessageSquare, Calendar } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { ContactSellerAgentModal } from "@/components/agent/contact-seller-agent-modal"
import { PropertyRequestsQueue } from "./property-requests-queue"

interface AgentDashboardProps {
  userId: string
  profile: {
    full_name: string | null
    email: string | null
  }
  agentProfile: {
    license_number: string | null
    brokerage_name: string | null
    phone: string | null
    years_experience: number | null
  } | null
}

interface Client {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
  client_type: "buyer" | "seller"
}

interface StayRequest {
  id: string
  property_id: string
  buyer_id: string
  check_in: string | null
  check_out: string | null
  status: string
  created_at: string
  message?: string | null
  properties: {
    title: string
    city: string
    state: string
    listing_price: number
  }
  buyer_profiles: {
    full_name: string | null
    email: string | null
  }
}

export function AgentDashboard({ userId, profile, agentProfile }: AgentDashboardProps) {
  const supabase = createClient()
  const [buyerClients, setBuyerClients] = useState<Client[]>([])
  const [sellerClients, setSellerClients] = useState<Client[]>([])
  const [stayRequests, setStayRequests] = useState<StayRequest[]>([])
  const [propertyListingRequests, setPropertyListingRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<StayRequest | null>(null)
  const [activeTab, setActiveTab] = useState("clients")

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch buyer clients
        const { data: buyerClientsData } = await supabase
          .from("buyer_profiles")
          .select(`
            id,
            profiles!buyer_profiles_id_fkey (
              id,
              full_name,
              email,
              created_at
            ),
            agent_email
          `)
          .eq("agent_email", profile.email)

        const formattedBuyerClients = buyerClientsData?.map(client => ({
          id: client.id,
          full_name: client.profiles?.full_name,
          email: client.profiles?.email,
          created_at: client.profiles?.created_at,
          client_type: "buyer" as const
        })) || []

        setBuyerClients(formattedBuyerClients)

        // Fetch seller clients
        const { data: sellerClientsData } = await supabase
          .from("seller_profiles")
          .select(`
            id,
            profiles!seller_profiles_id_fkey (
              id,
              full_name,
              email,
              created_at
            ),
            agent_email
          `)
          .eq("agent_email", profile.email)

        const formattedSellerClients = sellerClientsData?.map(client => ({
          id: client.id,
          full_name: client.profiles?.full_name,
          email: client.profiles?.email,
          created_at: client.profiles?.created_at,
          client_type: "seller" as const
        })) || []

        setSellerClients(formattedSellerClients)

        // Fetch stay requests from buyer clients (via API endpoint)
        console.log("Fetching stay requests for agent:", profile.email)
        let buyerStayRequests: StayRequest[] = []
        
        try {
          const response = await fetch('/api/agent/stay-requests', {
            method: 'GET',
            credentials: 'include',
          })
          
          if (response.ok) {
            const data = await response.json()
            buyerStayRequests = data.requests || []
          }
        } catch (error) {
          console.error("Error fetching stay requests:", error)
        }

        // Fetch stay requests for properties managed by seller clients
        let sellerStayRequests: StayRequest[] = []
        if (formattedSellerClients.length > 0) {
          try {
            const sellerClientIds = formattedSellerClients.map(c => c.id)
            const { data: propertiesData } = await supabase
              .from("properties")
              .select("id")
              .in("seller_id", sellerClientIds)

            if (propertiesData && propertiesData.length > 0) {
              const propertyIds = propertiesData.map(p => p.id)
              const { data: requestsData } = await supabase
                .from("stay_requests")
                .select(`
                  id,
                  property_id,
                  buyer_id,
                  check_in,
                  check_out,
                  status,
                  created_at,
                  message,
                  properties (
                    title,
                    city,
                    state,
                    listing_price
                  )
                `)
                .in("property_id", propertyIds)
                .order("created_at", { ascending: false })

              if (requestsData) {
                // Fetch buyer_profiles and profiles for these requests
                const buyerIds = requestsData.map(r => r.buyer_id)
                const { data: buyerProfilesData } = await supabase
                  .from("buyer_profiles")
                  .select("id, email")
                  .in("id", buyerIds)
                
                const { data: profilesData } = await supabase
                  .from("profiles")
                  .select("id, full_name, email")
                  .in("id", buyerIds)

                const buyerProfilesMap = new Map(
                  buyerProfilesData?.map(bp => [bp.id, bp]) || []
                )
                const profilesMap = new Map(
                  profilesData?.map(p => [p.id, p]) || []
                )

                sellerStayRequests = requestsData.map(request => {
                  const buyerProfile = buyerProfilesMap.get(request.buyer_id)
                  const profile = profilesMap.get(request.buyer_id)
                  return {
                    ...request,
                    buyer_profiles: {
                      full_name: profile?.full_name || null,
                      email: buyerProfile?.email || profile?.email || null,
                    }
                  } as StayRequest
                })
              }
            }
          } catch (error) {
            console.error("Error fetching seller stay requests:", error)
          }
        }

        // Combine both sets of stay requests (deduplicate by id)
        const allStayRequestsMap = new Map<string, StayRequest>()
        buyerStayRequests.forEach(req => allStayRequestsMap.set(req.id, req))
        sellerStayRequests.forEach(req => allStayRequestsMap.set(req.id, req))
        setStayRequests(Array.from(allStayRequestsMap.values()))

        // Fetch property listing requests for this agent
        try {
          const listingResponse = await fetch('/api/property-listing-requests')
          if (listingResponse.ok) {
            const listingData = await listingResponse.json()
            // Filter requests for this specific agent
            const agentListingRequests = listingData.requests?.filter(
              (req: any) => req.agent_email === profile.email
            ) || []
            setPropertyListingRequests(agentListingRequests)
          } else {
            setPropertyListingRequests([])
          }
        } catch (error) {
          console.error("Error fetching property listing requests:", error)
          setPropertyListingRequests([])
        }
      } catch (error) {
        console.error("Error fetching agent data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId, profile.email])

  const allClients = [...buyerClients, ...sellerClients]
  const pendingStayRequests = stayRequests.filter(r => r.status === "pending")
  const pendingListingRequests = propertyListingRequests.filter(
    (r: any) => r.status === "pending" || r.status === "listing_requested" || r.status === "listing_pending"
  )

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Agent Dashboard</h1>
              <p className="text-slate-600 mt-2">
                Manage your clients, stay requests, and property listings
                {agentProfile?.brokerage_name && (
                  <span className="ml-2 text-sm text-blue-600">
                    • {agentProfile.brokerage_name}
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("clients")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{allClients.length}</div>
                <p className="text-xs text-slate-500 mt-1">
                  {buyerClients.length} buyers • {sellerClients.length} sellers
                </p>
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("stay-requests")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Stay Requests</CardTitle>
                <Calendar className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingStayRequests.length}</div>
                {pendingStayRequests.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {pendingStayRequests.length === 1 ? '1 request' : `${pendingStayRequests.length} requests`} requires attention
                  </p>
                )}
              </CardContent>
            </Card>

            <Card 
              className="border-0 shadow-md cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab("listing-requests")}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Listing Requests</CardTitle>
                <Home className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingListingRequests.length}</div>
                {pendingListingRequests.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    {pendingListingRequests.length === 1 ? '1 request' : `${pendingListingRequests.length} requests`} awaiting action
                  </p>
                )}
              </CardContent>
            </Card>

          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <TabsList className="h-14 bg-transparent p-0 w-full grid grid-cols-3 !inline-grid !w-full !rounded-none !items-stretch">
                <TabsTrigger 
                  value="clients" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Clients</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="stay-requests" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Stay Requests</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="listing-requests" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 transition-all"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Listing Requests</span>
                    {pendingListingRequests.length > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                        {pendingListingRequests.length}
                      </Badge>
                    )}
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="clients">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>All Clients</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading clients...</div>
                  ) : allClients.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No clients assigned yet</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Clients will appear here when they select you as their agent during onboarding
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allClients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">
                                {client.full_name || "Unknown Client"}
                              </h3>
                              <Badge variant={client.client_type === "buyer" ? "default" : "secondary"}>
                                {client.client_type === "buyer" ? "Buyer" : "Seller"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">{client.email}</p>
                            <p className="text-xs text-slate-500">
                              Client since {new Date(client.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Message
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stay-requests">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Stay Requests</CardTitle>
                    {pendingStayRequests.length > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                        {pendingStayRequests.length} pending
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading requests...</div>
                  ) : stayRequests.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No stay requests yet</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Stay requests from your buyer clients will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {stayRequests.map((request) => (
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{request.properties.title}</h3>
                              <Badge variant={request.status === "pending" ? "secondary" : request.status === "confirmed" ? "default" : "outline"}>
                                {request.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {request.properties.city}, {request.properties.state}
                            </p>
                            <p className="text-sm text-slate-600">
                              Client: {request.buyer_profiles.full_name || request.buyer_profiles.email}
                            </p>
                            {(request.check_in || request.check_out) && (
                              <p className="text-sm text-slate-600">
                                {request.check_in ? new Date(request.check_in).toLocaleDateString() : 'TBD'} - {request.check_out ? new Date(request.check_out).toLocaleDateString() : 'TBD'}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Seller's Agent
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listing-requests">
              <PropertyRequestsQueue agentEmail={profile.email || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />

      {/* Contact Seller Agent Modal */}
      {selectedRequest && (
        <ContactSellerAgentModal
          stayRequest={selectedRequest}
          buyerAgentEmail={profile.email || ""}
          buyerAgentName={profile.full_name || "Agent"}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null)
          }}
        />
      )}
    </div>
  )
}
