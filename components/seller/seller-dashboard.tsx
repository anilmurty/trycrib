"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, DollarSign, Plus, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"
import { PropertyList } from "./property-list"
import { BookingsList } from "./bookings-list"

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
    }

    fetchStats()
  }, [userId, supabase])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">TryCrib</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/settings">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <span className="text-sm text-slate-600">Welcome, {profile?.full_name || "Seller"}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Seller Dashboard</h1>
            <p className="text-slate-600 mt-1">Manage your properties and bookings</p>
          </div>
          <Link href="/dashboard/seller/properties/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Property
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Properties</CardTitle>
              <Home className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
              <Badge variant="secondary">{stats.activeProperties}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProperties}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalEarnings.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">My Properties</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyList userId={userId} />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsList userId={userId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
