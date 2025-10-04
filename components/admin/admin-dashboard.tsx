"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Users, Calendar, DollarSign, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { PropertyVerification } from "./property-verification"
import { UserManagement } from "./user-management"
import { BookingsOverview } from "./bookings-overview"

interface AdminDashboardProps {
  userId: string
  profile: {
    full_name: string | null
    email: string | null
  }
}

export function AdminDashboard({ userId, profile }: AdminDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    async function fetchStats() {
      const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

      const { count: totalProperties } = await supabase.from("properties").select("*", { count: "exact", head: true })

      const { count: pendingVerifications } = await supabase
        .from("properties")
        .select("*", { count: "exact", head: true })
        .eq("verification_status", "pending")

      const { count: totalBookings } = await supabase.from("bookings").select("*", { count: "exact", head: true })

      const { data: bookings } = await supabase.from("bookings").select("total_price").eq("status", "confirmed")

      const totalRevenue = bookings?.reduce((sum, booking) => sum + (booking.total_price || 0), 0) || 0

      setStats({
        totalUsers: totalUsers || 0,
        totalProperties: totalProperties || 0,
        pendingVerifications: pendingVerifications || 0,
        totalBookings: totalBookings || 0,
        totalRevenue,
      })
    }

    fetchStats()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">TryCrib Admin</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600">Welcome, {profile.full_name || "Admin"}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage properties, users, and platform operations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-5 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

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
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <div className="h-4 w-4 rounded-full bg-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="properties" className="space-y-6">
          <TabsList>
            <TabsTrigger value="properties">Property Verification</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
          </TabsList>

          <TabsContent value="properties">
            <PropertyVerification />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="bookings">
            <BookingsOverview />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
