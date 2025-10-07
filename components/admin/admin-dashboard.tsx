"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Users, Calendar, DollarSign } from "lucide-react"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertyVerificationPaginated } from "./property-verification-paginated"
import { PropertyClaims } from "./property-claims"
import { PropertyFeedImport } from "./property-feed-import"
import { UserManagement } from "./user-management"
import { BookingsOverview } from "./bookings-overview"
import { PricingManagement } from "./pricing-management"
import { useRouter } from "next/navigation"
import { useClerk } from "@clerk/nextjs"

interface AdminDashboardProps {
  userId: string
  profile: {
    full_name: string | null
    email: string | null
  }
}

export function AdminDashboard({ userId, profile }: AdminDashboardProps) {
  const router = useRouter()
  const { signOut } = useClerk()
  const supabase = createClient()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    pendingVerifications: 0,
    totalBookings: 0,
    totalRevenue: 0,
  })

  const refreshStats = async () => {
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

  useEffect(() => {
    refreshStats()
  }, [supabase])

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
            <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-slate-600 mt-2">Manage properties, users, and platform operations</p>
          </div>

          <div className="grid gap-6 md:grid-cols-5 mb-8">
            <Card className="border-0 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

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
                <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
                <div className="h-4 w-4 rounded-full bg-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
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
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-slate-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

      <Tabs defaultValue="properties" className="space-y-6">
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm">
            <TabsList className="grid w-full grid-cols-6 h-14 bg-gray-50 p-1">
              <TabsTrigger 
                value="properties" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Property Verification</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="claims" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>Property Claims</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                  <span>Feed Import</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="pricing" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200 data-[state=active]:ring-2 data-[state=active]:ring-blue-100"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Pricing Management</span>
                  <span className="text-xs text-gray-500">(2 sub-sections)</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>User Management</span>
                </div>
              </TabsTrigger>
              <TabsTrigger 
                value="bookings" 
                className="text-sm font-semibold data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:border data-[state=active]:border-gray-200"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  <span>Bookings</span>
                </div>
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

            <TabsContent value="properties">
              <PropertyVerificationPaginated />
            </TabsContent>

            <TabsContent value="claims">
              <PropertyClaims />
            </TabsContent>

            <TabsContent value="import">
              <PropertyFeedImport 
                currentUserId={userId} 
                currentUserRole={profile.role}
                onImportComplete={refreshStats}
              />
            </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">$</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pricing Management</h2>
                <p className="text-gray-600">Configure pricing tiers and manage property pricing across the platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Pricing Tiers Configuration</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>Individual Property Management</span>
              </div>
            </div>
          </div>
          <PricingManagement />
        </TabsContent>

            <TabsContent value="users">
              <UserManagement currentUserId={userId} currentUserRole={profile.role} />
            </TabsContent>

            <TabsContent value="bookings">
              <BookingsOverview />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
