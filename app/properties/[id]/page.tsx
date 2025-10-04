import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PropertyDetails } from "@/components/buyer/property-details"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: property } = await supabase.from("properties").select("*").eq("id", id).single()

  if (!property) {
    notFound()
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <PropertyDetails property={property} userId={user?.id} />
      </main>
      <Footer />
    </div>
  )
}
