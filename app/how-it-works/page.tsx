import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { HowItWorksContent } from "@/components/landing/how-it-works-content"

export default function HowItWorksPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <HowItWorksContent />
      </main>
      <Footer />
    </div>
  )
}
