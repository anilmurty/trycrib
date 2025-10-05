import { redirect } from "next/navigation"
import { auth, currentUser } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { OnboardingClient } from "@/components/onboarding/onboarding-client"

export default async function OnboardingPage() {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    redirect("/auth")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  // If user already has a role, redirect to dashboard
  if (profile?.role) {
    redirect("/dashboard")
  }

  return <OnboardingClient firstName={user.firstName || "there"} />
}
