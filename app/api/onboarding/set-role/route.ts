import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { role } = await request.json()

    if (!role || (role !== "buyer" && role !== "seller")) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const supabase = await createClient()

    // Update the user's role in the profiles table
    const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", userId)

    if (updateError) {
      console.error("Error updating profile role:", updateError)
      return NextResponse.json({ error: "Failed to update role" }, { status: 500 })
    }

    // Create the appropriate profile (buyer_profiles or seller_profiles)
    if (role === "buyer") {
      const { error: buyerError } = await supabase.from("buyer_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (buyerError) {
        console.error("Error creating buyer profile:", buyerError)
      }
    } else if (role === "seller") {
      const { error: sellerError } = await supabase.from("seller_profiles").upsert({
        id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (sellerError) {
        console.error("Error creating seller profile:", sellerError)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in set-role API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
