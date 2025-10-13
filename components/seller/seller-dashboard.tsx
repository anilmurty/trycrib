"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, DollarSign } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertyList } from "./property-list"
import { PropertySearch } from "@/components/property-search"
import { BookingsList } from "./bookings-list"
import { PropertyClaiming } from "./property-claiming"
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
  })

  useEffect(() => {
    async function fetchStats() {
      try {
        // Get properties count
        const { count: totalProperties } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", userId)

        const { count: activeProperties } = await supabase
          .from("properties")
          .select("*", { count: "exact", head: true })
          .eq("seller_id", userId)
          .eq("is_active", true)

        // Get bookings
        const { data: properties } = await supabase.from("properties").select("id").eq("seller_id", userId)

        const propertyIds = properties?.map((p) => p.id) || []

        if (propertyIds.length > 0) {
          const { count: totalBookings } = await supabase
            .from("bookings")
            .select("*", { count: "exact", head: true })
            .in("property_id", propertyIds)

          const { data: bookings } = await supabase
            .from("bookings")
            .select("total_price")
            .in("property_id", propertyIds)
            .eq("status", "confirmed")

          const totalEarnings = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

          setStats({
            totalProperties: totalProperties || 0,
            activeProperties: activeProperties || 0,
            totalBookings: totalBookings || 0,
            totalEarnings,
          })
        } else {
          setStats({
            totalProperties: totalProperties || 0,
            activeProperties: activeProperties || 0,
            totalBookings: 0,
            totalEarnings: 0,
          })
        }
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
              <p className="text-slate-600 mt-2">View your claimed properties and request your agent to add them to TryCrib listings</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
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
          </div>

          <Tabs defaultValue="search" className="space-y-6">
            <TabsList>
              <TabsTrigger value="search">Find Properties</TabsTrigger>
              <TabsTrigger value="properties">My Properties</TabsTrigger>
              <TabsTrigger value="claim">Claim Property</TabsTrigger>
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
            </TabsList>

            <TabsContent value="search">
              <PropertySearch 
                userRole="seller" 
                userId={userId}
              />
            </TabsContent>

            <TabsContent value="properties">
              <PropertyList userId={userId} />
            </TabsContent>

            <TabsContent value="claim">
              <PropertyClaiming userId={userId} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsList userId={userId} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
