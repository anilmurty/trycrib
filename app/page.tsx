import { HeroSection } from "@/components/landing/hero-section"
import { FeaturedProperties } from "@/components/landing/featured-properties"
import { HowItWorks } from "@/components/landing/how-it-works"
import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HeroSection />
        {/* Hidden: Featured Properties section */}
        {/* <FeaturedProperties /> */}
        <HowItWorks />
      </main>
      <Footer />
    </div>
  )
}
