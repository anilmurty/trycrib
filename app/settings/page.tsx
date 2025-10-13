import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

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

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-600 mt-2">Manage your account information</p>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>Your profile details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <p className="text-slate-900 mt-1">{profile?.full_name || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <p className="text-slate-900 mt-1">{profile?.email || "Not set"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <p className="text-slate-900 mt-1 capitalize">{profile?.role || "Not set"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Agent Information for Buyers and Sellers */}
            {(profile?.role === "buyer" || profile?.role === "seller") && roleProfile && (
              <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                  <CardTitle>Agent Information</CardTitle>
                  <CardDescription>
                    Your {profile.role === "buyer" ? "buyer's" : "seller's"} agent contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Agent Name</label>
                    <p className="text-slate-900 mt-1">{roleProfile.agent_name || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Agent Email</label>
                    <p className="text-slate-900 mt-1">{roleProfile.agent_email || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Agent Phone</label>
                    <p className="text-slate-900 mt-1">{roleProfile.agent_phone || "Not provided"}</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
