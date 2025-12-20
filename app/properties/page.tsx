import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { PropertiesList } from "@/components/properties/properties-list"
import { ListingRequestBanner } from "@/components/properties/listing-request-banner"

export default function PropertiesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 py-12 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Available Properties</h1>
            <p className="mt-2 text-slate-600">Browse homes you can try before buying</p>
          </div>

          <ListingRequestBanner />
          <PropertiesList />
        </div>
      </main>
      <Footer />
    </div>
  )
}