import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET to .env")
  }

  // Get the headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error verifying webhook:", err)
    return new Response("Error occured", {
      status: 400,
    })
  }

  // Use service role client to bypass RLS for webhook operations
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle the webhook
  const eventType = evt.type

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name, unsafe_metadata } = evt.data

    const email = email_addresses[0]?.email_address
    const full_name = `${first_name || ""} ${last_name || ""}`.trim()
    const role = (unsafe_metadata?.role as string) || "buyer"

    // Create profile in Supabase
    const { error: profileError } = await supabase.from("profiles").insert({
      id,
      email,
      full_name: full_name || null,
      role,
      verification_status: "pending",
    })

    if (profileError) {
      console.error("Error creating profile:", profileError)
      return new Response("Error creating profile", { status: 500 })
    }

    // Create role-specific profile
    if (role === "buyer") {
      await supabase.from("buyer_profiles").insert({ id })
    } else if (role === "seller") {
      await supabase.from("seller_profiles").insert({ id })
    } else if (role === "agent") {
      await supabase.from("agent_profiles").insert({ id, email })
    }

    // Check if this user was invited and mark invitation as accepted
    // Only mark if role matches (buyer or seller - not agent)
    if (email && (role === "buyer" || role === "seller")) {
      const { data: invitations } = await supabase
        .from("client_invitations")
        .select("*")
        .eq("email", email.toLowerCase())
        .eq("role", role)
        .eq("status", "pending")

      if (invitations && invitations.length > 0) {
        // Update pending invitations for this email and role to accepted
        await supabase
          .from("client_invitations")
          .update({
            status: "accepted",
            accepted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq("email", email.toLowerCase())
          .eq("role", role)
          .eq("status", "pending")
      }
    }
  }

  if (eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data

    const email = email_addresses[0]?.email_address
    const full_name = `${first_name || ""} ${last_name || ""}`.trim()

    await supabase
      .from("profiles")
      .update({
        email,
        full_name: full_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data

    if (id) {
      await supabase.from("profiles").delete().eq("id", id)
    }
  }

  return new Response("", { status: 200 })
}
