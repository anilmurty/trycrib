import { redirect } from "next/navigation"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { PropertyForm } from "@/components/seller/property-form"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default async function NewPropertyPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  const supabase = await createClient()
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).single()

  if (profile?.role !== "seller") {
    redirect("/dashboard/buyer")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">List Your Property</h1>
            <p className="text-slate-600 mt-2">Add your home to TryCrib and start earning</p>
          </div>
          <PropertyForm userId={userId} />
        </div>
      </main>

      <Footer />
    </div>
  )
}
