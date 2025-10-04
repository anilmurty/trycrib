"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Home, Calendar, LogOut, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  check_in: string
  check_out: string
  total_price: number
  status: string
  properties: {
    id: string
    title: string
    city: string
    state: string
    images: string[] | null
  }
}

interface BuyerDashboardProps {
  userId: string
  profile: {
    full_name: string | null
    email: string | null
  }
}

export function BuyerDashboard({ userId, profile }: BuyerDashboardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookings() {
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          properties (id, title, city, state, images)
        `,
        )
        .eq("buyer_id", userId)
        .order("created_at", { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }

    fetchBookings()
  }, [userId, supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const upcomingBookings = bookings.filter((b) => new Date(b.check_in) > new Date() && b.status === "confirmed")
  const pastBookings = bookings.filter((b) => new Date(b.check_out) < new Date())

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">TryCrib</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/properties">
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Browse Homes
              </Button>
            </Link>
            <span className="text-sm text-slate-600">Welcome, {profile.full_name || "Buyer"}</span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-slate-600 mt-1">View and manage your property stays</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Stays</CardTitle>
              <Badge variant="secondary">{upcomingBookings.length}</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingBookings.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Past Stays</CardTitle>
              <Home className="h-4 w-4 text-slate-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastBookings.length}</div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="text-center py-8 text-slate-600">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-slate-600 mb-4">You haven't booked any stays yet</p>
              <Link href="/properties">
                <Button>
                  <Search className="h-4 w-4 mr-2" />
                  Browse Properties
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {upcomingBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Upcoming Stays</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {upcomingBookings.map((booking) => (
                    <Card key={booking.id}>
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {booking.properties.images && booking.properties.images.length > 0 ? (
                            <img
                              src={booking.properties.images[0] || "/placeholder.svg"}
                              alt={booking.properties.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">{booking.properties.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {booking.properties.city}, {booking.properties.state}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(booking.check_in).toLocaleDateString()} -{" "}
                              {new Date(booking.check_out).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="default">{booking.status}</Badge>
                            <span className="text-sm font-semibold text-slate-900">
                              ${booking.total_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-slate-900 mb-4">Past Stays</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {pastBookings.map((booking) => (
                    <Card key={booking.id}>
                      <div className="flex gap-4 p-4">
                        <div className="w-24 h-24 rounded-lg overflow-hidden bg-slate-200 shrink-0">
                          {booking.properties.images && booking.properties.images.length > 0 ? (
                            <img
                              src={booking.properties.images[0] || "/placeholder.svg"}
                              alt={booking.properties.title}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-6 w-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-slate-900 line-clamp-1">{booking.properties.title}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {booking.properties.city}, {booking.properties.state}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(booking.check_in).toLocaleDateString()} -{" "}
                              {new Date(booking.check_out).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <Badge variant="secondary">{booking.status}</Badge>
                            <span className="text-sm font-semibold text-slate-900">
                              ${booking.total_price.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
