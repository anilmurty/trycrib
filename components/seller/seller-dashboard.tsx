"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, DollarSign, Clock } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertyList } from "./property-list"
import { BookingsList } from "./bookings-list"
import { PropertyRequests } from "./property-requests"
import { useClerk } from "@clerk/clerk-react"
import { useRouter } from "next/navigation"

interface SellerDashboardProps {
  userId: string
  profile: {
    full_name: string | null
    email: string | null
  }
}

export function SellerDashboard({ userId, profile }: SellerDashboardProps) {
  const router = useRouter()
  const { signOut } = useClerk()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalProperties: 0,
    activeProperties: 0,
    totalBookings: 0,
    totalEarnings: 0,
    pendingRequests: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get properties count
        const { count: totalProperties, error: propertiesError } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", userId)

        const { count: activeProperties, error: activeError } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", userId)
          .eq("is_active", true)

        console.log("Properties query results:", { 
          totalProperties, 
          activeProperties, 
          propertiesError, 
          activeError,
          userId 
        })

        // Let's also check what properties actually exist for this seller
        const { data: allProperties, error: allPropertiesError } = await supabase
          .from("properties")
          .select("id, seller_id, title, is_active")
          .eq("seller_id", userId)
        
        console.log("All properties for seller:", { allProperties, allPropertiesError, userId })

        // Get pending requests count - fetch actual data to ensure accurate count
        const { data: pendingRequestsData, error: requestsError } = await supabase
          .from("property_listing_requests")
          .select("id, status")
          .eq("seller_id", userId)
          .in("status", ["listing_requested", "approval_pending", "pending", "listing_pending"])

        const pendingRequests = pendingRequestsData?.length || 0
        console.log("Pending requests query result:", { pendingRequests, requestsError, pendingRequestsData })

        // Get bookings
        const { data: properties } = await supabase.from("properties").select("id").eq("seller_id", userId)

        const propertyIds = properties?.map((p) => p.id) || []

        let totalBookings = 0
        let totalEarnings = 0

        if (propertyIds.length > 0) {
          const { count: bookingsCount } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds)

          const { data: bookings } = await supabase
            .from("bookings")
            .select("total_price")
            .in("property_id", propertyIds)
            .eq("status", "confirmed")

          totalBookings = bookingsCount || 0
          totalEarnings = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0
        }

        setStats({
          totalProperties: totalProperties || 0,
          activeProperties: activeProperties || 0,
          totalBookings,
          totalEarnings,
          pendingRequests: pendingRequests || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [userId, supabase])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
              <p className="text-slate-600 mt-2">Manage existing properties. Request new listings.</p>
            </div>
          </div>

          <Tabs defaultValue="properties" className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
              <TabsList className="h-14 bg-transparent p-0 w-full grid grid-cols-3 !inline-grid !w-full !rounded-none !items-stretch">
                <TabsTrigger 
                  value="properties" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span>Active Listings</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="requests" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span>Pending Listings</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="bookings" 
                  className="h-12 px-6 text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
                >
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <span>Bookings</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="properties">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
                      <Home className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalProperties}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                      <Badge variant="secondary">{stats.activeProperties}</Badge>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.activeProperties}</div>
                    </CardContent>
                  </Card>
                </div>
                <PropertyList userId={userId} />
              </div>
            </TabsContent>

            <TabsContent value="bookings">
              <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                      <Calendar className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.totalBookings}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                      <DollarSign className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
                      <Clock className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.pendingRequests}</div>
                    </CardContent>
                  </Card>
                </div>
                <BookingsList userId={userId} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
