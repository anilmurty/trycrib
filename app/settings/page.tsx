import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { SettingsClient } from "@/components/settings/settings-client"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()
  
  // Fetch role-specific profile data
  let roleProfile = null
  if (profile?.role === "buyer") {
    const { data } = await supabase.from("buyer_profiles").select("*").eq("id", userId).single()
    roleProfile = data
  } else if (profile?.role === "seller") {
    const { data } = await supabase.from("seller_profiles").select("*").eq("id", userId).single()
    roleProfile = data
  }

  return <SettingsClient profile={profile} roleProfile={roleProfile} userId={userId} />
}