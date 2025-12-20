"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Home, Calendar, DollarSign, MessageSquare } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertyPricingModal } from "./property-pricing-modal"
import { PropertySearch } from "@/components/property-search"
import { PropertyRequestsQueue } from "./property-requests-queue"

interface SellerAgentDashboardProps {
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
  seller_profiles: {
    agent_name: string | null
    agent_email: string | null
    agent_phone: string | null
  }
}

interface Property {
  id: string
  title: string
  city: string
  state: string
  listing_price: number
  is_active: boolean
  created_at: string
  seller_id: string
}

interface StayRequest {
  id: string
  property_id: string
  buyer_id: string
  check_in: string
  check_out: string
  status: string
  created_at: string
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

export function SellerAgentDashboard({ userId, profile, agentProfile }: SellerAgentDashboardProps) {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [stayRequests, setStayRequests] = useState<StayRequest[]>([])
  const [propertyRequests, setPropertyRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const refreshData = () => {
    fetchData()
  }

  const fetchData = async () => {
    try {
        // Fetch clients (sellers assigned to this agent)
        const { data: clientsData } = await supabase
          .from("seller_profiles")
          .select(`
            id,
            profiles!seller_profiles_id_fkey (
              id,
              full_name,
              email,
              created_at
            ),
            agent_name,
            agent_email,
            agent_phone
          `)
          .eq("agent_email", profile.email)

        const formattedClients = clientsData?.map(client => ({
          id: client.id,
          full_name: client.profiles?.full_name,
          email: client.profiles?.email,
          created_at: client.profiles?.created_at,
          seller_profiles: {
            agent_name: client.agent_name,
            agent_email: client.agent_email,
            agent_phone: client.agent_phone
          }
        })) || []

        setClients(formattedClients)

        // Fetch properties for clients
        if (formattedClients.length > 0) {
          const clientIds = formattedClients.map(c => c.id)
          const { data: propertiesData } = await supabase
            .from("properties")
            .select("*")
            .in("seller_id", clientIds)
            .order("created_at", { ascending: false })

          setProperties(propertiesData || [])

          // Fetch stay requests for these properties
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
                properties (
                  title,
                  city,
                  state,
                  listing_price
                ),
                buyer_profiles!stay_requests_buyer_id_fkey (
                  full_name,
                  email
                )
              `)
              .in("property_id", propertyIds)
              .order("created_at", { ascending: false })

            setStayRequests(requestsData || [])
          }
        }

        // Fetch property listing requests for this agent
        console.log("Agent profile email:", profile.email)
        
        // First try direct query
        const { data: propertyRequestsData, error: requestsError } = await supabase
          .from("property_listing_requests")
          .select("*")
          .eq("agent_email", profile.email)
          .order("created_at", { ascending: false })

        console.log("Direct query result:", propertyRequestsData)
        console.log("Direct query error:", requestsError)

        // If direct query fails, try using API route (bypasses RLS) - only on client side
        if (requestsError || !propertyRequestsData || propertyRequestsData.length === 0) {
          console.log("Trying API route fallback...")
          // Only run fetch on client side to avoid SSR issues
          if (typeof window !== 'undefined') {
            try {
              const response = await fetch('/api/property-listing-requests', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
              })
              if (response.ok) {
                const result = await response.json()
                const agentRequests = result.requests?.filter((req: any) => req.agent_email === profile.email) || []
                console.log("API route result for agent:", agentRequests)
                setPropertyRequests(agentRequests)
              } else {
                console.log("API route failed:", response.status)
                setPropertyRequests([])
              }
            } catch (apiError) {
              console.error("API route error:", apiError)
              setPropertyRequests([])
            }
          } else {
            setPropertyRequests([])
          }
        } else {
          setPropertyRequests(propertyRequestsData || [])
        }
      } catch (error) {
        console.error("Error fetching agent data:", error)
      } finally {
        setLoading(false)
      }
    }

  useEffect(() => {
    fetchData()
  }, [userId, profile.email, supabase])

  const activeProperties = properties.filter(p => p.is_active)
  const pendingRequests = propertyRequests.filter(r => r.status === "pending" || r.status === "listing_requested" || r.status === "listing_pending")
  const confirmedRequests = stayRequests.filter(r => r.status === "confirmed")
  
  console.log("All property requests:", propertyRequests)
  console.log("Pending requests count:", pendingRequests.length)

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Seller's Agent Dashboard</h1>
              <p className="text-slate-600 mt-2">
                Manage your clients' properties and stay requests
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
                <div className="text-2xl font-bold">{clients.length}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Properties</CardTitle>
                <Home className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activeProperties.length}</div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                <Calendar className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingRequests.length}</div>
              </CardContent>
            </Card>

          </div>

          <Tabs defaultValue="properties" className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <TabsList className="h-14 bg-transparent p-0 w-full grid grid-cols-7 !inline-grid !w-full !rounded-none !items-stretch">
                <TabsTrigger 
                  value="properties" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Properties</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="property-requests" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Property Requests</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="search" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span>Find Properties</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="pricing" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Pricing Management</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="clients" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span>Clients</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="requests" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span>Stay Requests</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                    <span>Messages</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="search">
              <PropertySearch 
                userRole="seller_agent" 
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="property-requests">
              <PropertyRequestsQueue agentEmail={profile.email || ""} />
            </TabsContent>

            <TabsContent value="properties">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Client Properties</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading properties...</div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Home className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No properties yet</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Properties from your clients will appear here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{property.title}</h3>
                              <Badge variant={property.is_active ? "default" : "secondary"}>
                                {property.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {property.city}, {property.state}
                            </p>
                            <p className="text-sm text-slate-600">
                              ${property.listing_price.toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Owner
                            </Button>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Property Pricing Management</CardTitle>
                  <p className="text-sm text-slate-600 mt-2">
                    Set pricing for your clients' properties. All pricing requires seller approval.
                  </p>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading properties...</div>
                  ) : properties.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No properties to manage pricing for</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Properties from your clients will appear here for pricing management
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {properties.map((property) => (
                        <div key={property.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900">{property.title}</h3>
                              <Badge variant={property.is_active ? "default" : "secondary"}>
                                {property.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600">
                              {property.city}, {property.state}
                            </p>
                            <p className="text-sm text-slate-600">
                              Listed for: ${property.listing_price.toLocaleString()}
                            </p>
                            <div className="mt-2 flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">TryCrib Price:</span>
                                <span className="text-sm text-slate-600">
                                  {property.price_per_night ? `$${property.price_per_night}/night` : "Not set"}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">Status:</span>
                                <Badge variant="outline">
                                  {property.price_per_night ? "Pricing Set" : "Needs Pricing"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <PropertyPricingModal 
                              property={property} 
                              onPricingUpdated={refreshData}
                            />
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="clients">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Client List</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8 text-slate-600">Loading clients...</div>
                  ) : clients.length === 0 ? (
                    <div className="text-center py-8 text-slate-600">
                      <Users className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                      <p>No clients assigned yet</p>
                      <p className="text-sm text-slate-500 mt-2">
                        Clients will appear here when they select you as their agent during onboarding
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clients.map((client) => (
                        <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {client.full_name || "Unknown Client"}
                            </h3>
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

            <TabsContent value="requests">
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
                        Stay requests for your clients' properties will appear here
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
                              Buyer: {request.buyer_profiles.full_name || request.buyer_profiles.email}
                            </p>
                            <p className="text-sm text-slate-600">
                              {new Date(request.check_in).toLocaleDateString()} - {new Date(request.check_out).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            {request.status === "pending" && (
                              <>
                                <Button size="sm">Approve</Button>
                                <Button variant="outline" size="sm">Decline</Button>
                              </>
                            )}
                            <Button variant="outline" size="sm">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="messages">
              <Card className="border-0 shadow-md">
                <CardHeader>
                  <CardTitle>Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-slate-600">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                    <p>No messages yet</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Messages from clients and other agents will appear here
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
