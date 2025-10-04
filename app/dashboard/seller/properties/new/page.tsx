import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/seller/property-form"

export default async function NewPropertyPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "seller") {
    redirect("/dashboard/buyer")
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container py-8 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">List Your Property</h1>
          <p className="text-slate-600 mt-1">Add your home to TryCrib and start earning</p>
        </div>
        <PropertyForm userId={user.id} />
      </div>
    </div>
  )
}
