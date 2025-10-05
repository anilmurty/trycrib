import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardRedirect() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/auth")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (!profile?.role) {
    redirect("/onboarding")
  }

  // Redirect based on user role
  if (profile.role === "seller") {
    redirect("/dashboard/seller")
  } else if (profile.role === "admin") {
    redirect("/admin")
  } else {
    // Default to buyer dashboard
    redirect("/dashboard/buyer")
  }
}
