import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { token, email } = await request.json()

    if (!token && !email) {
      return NextResponse.json({ error: "Token or email is required" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find user by token or email
    let query = supabase.from("profiles").select("id, email, email_unsubscribed")

    if (token) {
      query = query.eq("unsubscribe_token", token)
    } else if (email) {
      query = query.eq("email", email)
    }

    const { data: profile, error } = await query.single()

    if (error || !profile) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Update unsubscribe status
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ email_unsubscribed: true })
      .eq("id", profile.id)

    if (updateError) {
      console.error("Error updating unsubscribe status:", updateError)
      return NextResponse.json({ error: "Failed to update preferences" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully unsubscribed from marketing emails. You will still receive important transactional emails related to your account, stay requests, property listings, and other account activities.",
    })
  } catch (error: any) {
    console.error("Error in unsubscribe route:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
