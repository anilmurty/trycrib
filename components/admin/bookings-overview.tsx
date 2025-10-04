"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface Booking {
  id: string
  check_in: string
  check_out: string
  total_price: number
  status: string
  created_at: string
  properties: {
    title: string
    city: string
    state: string
  }
  profiles: {
    full_name: string | null
    email: string
  }
}

export function BookingsOverview() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookings() {
      const { data } = await supabase
        .from("bookings")
        .select(
          `
          *,
          properties (title, city, state),
          profiles (full_name, email)
        `,
        )
        .order("created_at", { ascending: false })

      setBookings(data || [])
      setLoading(false)
    }

    fetchBookings()
  }, [supabase])

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading bookings...</div>
  }

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed")
  const pendingBookings = bookings.filter((b) => b.status === "pending")
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled")

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-900">{confirmedBookings.length}</div>
            <p className="text-sm text-slate-600 mt-1">Confirmed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-900">{pendingBookings.length}</div>
            <p className="text-sm text-slate-600 mt-1">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-slate-900">{cancelledBookings.length}</div>
            <p className="text-sm text-slate-600 mt-1">Cancelled</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Bookings</h2>
        <div className="space-y-4">
          {bookings.slice(0, 10).map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{booking.properties.title}</CardTitle>
                    <p className="text-sm text-slate-600 mt-1">
                      {booking.properties.city}, {booking.properties.state}
                    </p>
                    <p className="text-sm text-slate-600">Buyer: {booking.profiles.email}</p>
                  </div>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "default"
                        : booking.status === "pending"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {booking.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(booking.check_in).toLocaleDateString()} -{" "}
                      {new Date(booking.check_out).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">${booking.total_price.toLocaleString()}</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
