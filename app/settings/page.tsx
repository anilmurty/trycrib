import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, CreditCard } from "lucide-react"
import Link from "next/link"

export default async function SettingsPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", userId).single()

  const dashboardUrl = profile?.role === "seller" ? "/dashboard/seller" : "/dashboard/buyer"

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Home className="h-5 w-5 text-slate-900" />
            <span className="text-lg font-bold text-slate-900">TryCrib</span>
          </Link>
          <Link href={dashboardUrl}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
          <p className="text-slate-600 mt-1">Manage your account and subscription</p>
        </div>

        <div className="space-y-6">
          <Card>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Subscription & Billing
              </CardTitle>
              <CardDescription>Manage your subscription and payment methods</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">
                Access the Stripe Customer Portal to manage your subscription, update payment methods, and view billing
                history.
              </p>
              <form action="/api/create-portal-session" method="POST">
                <Button type="submit" className="w-full sm:w-auto">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
