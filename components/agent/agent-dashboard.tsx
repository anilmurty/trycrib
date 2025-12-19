"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, Home, MessageSquare } from "lucide-react"
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
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState<StayRequest | null>(null)

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

        // Fetch stay requests via API endpoint (bypasses RLS)
        console.log("Fetching stay requests for agent:", profile.email)
        
        try {
          const response = await fetch('/api/agent/stay-requests', {
            method: 'GET',
            credentials: 'include',
          })
          
          if (response.ok) {
            const data = await response.json()
            setStayRequests(data.requests || [])
          } else {
            setStayRequests([])
          }
        } catch (error) {
          console.error("Error fetching stay requests:", error)
          setStayRequests([])
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
  const pendingRequests = stayRequests.filter(r => r.status === "pending")
  const confirmedRequests = stayRequests.filter(r => r.status === "confirmed")

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
            <Card className="border-0 shadow-md">
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

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Stay Requests</CardTitle>
                <Badge variant="secondary">{pendingRequests.length}</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed Stays</CardTitle>
                <Calendar className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{confirmedRequests.length}</div>
              </CardContent>
            </Card>

          </div>

          <Tabs defaultValue="clients" className="space-y-6">
            <TabsList>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="stay-requests">Stay Requests</TabsTrigger>
              <TabsTrigger value="listing-requests">Listing Requests</TabsTrigger>
            </TabsList>

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
                        <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
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
                  <CardTitle>Stay Requests</CardTitle>
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
                        <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{request.properties.title}</h3>
                              <Badge variant={request.status === "pending" ? "secondary" : "default"}>
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
                            {request.status === "pending" && (
                              <>
                                <Button size="sm">Approve</Button>
                                <Button variant="outline" size="sm">Decline</Button>
                              </>
                            )}
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
