import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { propertyId, checkIn, checkOut, totalPrice } = await request.json()

    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get property details
    const { data: property } = await supabase.from("properties").select("*").eq("id", propertyId).single()

    if (!property) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Create booking record
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert([
        {
          property_id: propertyId,
          buyer_id: userId,
          check_in: checkIn,
          check_out: checkOut,
          total_price: totalPrice,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 400 })
    }

    // Calculate nights
    const nights = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: property.title,
              description: `${nights} night${nights > 1 ? "s" : ""} at ${property.city}, ${property.state}`,
            },
            unit_amount: Math.round(totalPrice * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${request.headers.get("origin")}/booking/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${booking.id}`,
      cancel_url: `${request.headers.get("origin")}/properties/${propertyId}`,
      metadata: {
        bookingId: booking.id,
        propertyId: propertyId,
        buyerId: userId,
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: unknown) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
