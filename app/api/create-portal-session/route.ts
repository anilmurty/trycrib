import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user's Stripe customer ID from the database
    const supabase = await createClient()
    const { data: bookings } = await supabase
      .from("bookings")
      .select("stripe_payment_intent_id")
      .eq("buyer_id", userId)
      .not("stripe_payment_intent_id", "is", null)
      .limit(1)
      .single()

    let customerId: string | undefined

    // If we have a payment intent, get the customer ID from it
    if (bookings?.stripe_payment_intent_id) {
      const paymentIntent = await stripe.paymentIntents.retrieve(bookings.stripe_payment_intent_id)
      if (typeof paymentIntent.customer === "string") {
        customerId = paymentIntent.customer
      }
    }

    // If no customer ID found, we need to create a customer portal session without a customer
    // In a real app, you'd want to create a Stripe customer when the user signs up
    if (!customerId) {
      return NextResponse.json(
        {
          error: "No subscription found. Please make a booking first to access billing management.",
        },
        { status: 400 },
      )
    }

    // Create a billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings`,
    })

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error("Error creating portal session:", error)
    return NextResponse.json({ error: "Failed to create portal session" }, { status: 500 })
  }
}
