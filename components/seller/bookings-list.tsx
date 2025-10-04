"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"

interface Booking {
  id: string
  check_in: string
  check_out: string
  total_price: number
  status: string
  properties: {
    title: string
  }
  profiles: {
    full_name: string
    email: string
  }
}

export function BookingsList({ userId }: { userId: string }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookings() {
      // First get all properties for this seller
      const { data: properties } = await supabase.from("properties").select("id").eq("seller_id", userId)

      const propertyIds = properties?.map((p) => p.id) || []

      if (propertyIds.length > 0) {
        const { data } = await supabase
          .from("bookings")
          .select(
            `
            *,
            properties (title),
            profiles (full_name, email)
          `,
          )
          .in("property_id", propertyIds)
          .order("created_at", { ascending: false })

        setBookings(data || [])
      }
      setLoading(false)
    }

    fetchBookings()
  }, [userId, supabase])

  if (loading) {
    return <div className="text-center py-8 text-slate-600">Loading bookings...</div>
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-slate-600">No bookings yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">{booking.properties.title}</CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{booking.profiles.full_name || booking.profiles.email}</span>
                </div>
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
                  {new Date(booking.check_in).toLocaleDateString()} - {new Date(booking.check_out).toLocaleDateString()}
                </span>
              </div>
              <div className="text-lg font-semibold text-slate-900">${booking.total_price.toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
