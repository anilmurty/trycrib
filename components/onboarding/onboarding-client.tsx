"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, Store } from "lucide-react"

interface OnboardingClientProps {
  firstName: string
}

export function OnboardingClient({ firstName }: OnboardingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRoleSelection = async (role: "buyer" | "seller") => {
    console.log("=== ONBOARDING CLIENT: Role selection started ===")
    console.log("Selected role:", role)
    
    setLoading(true)
    setError("")

    try {
      console.log("Making API call to /api/onboarding/set-role")
      const response = await fetch("/api/onboarding/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      })

      console.log("API response status:", response.status)
      console.log("API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.log("API error response:", errorText)
        console.log("Full response object:", response)
        console.log("Response headers:", Object.fromEntries(response.headers.entries()))
        throw new Error(`Failed to set role: ${response.status} - ${errorText}`)
      }

      console.log("API call successful, redirecting to dashboard")
      // Redirect to appropriate dashboard
      router.push("/dashboard")
    } catch (err) {
      console.error("Error in handleRoleSelection:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome, {firstName}!</h1>
          <p className="text-xl text-slate-600">Are you looking to buy a home or to sell a home?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">{error}</div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <Card
            className="p-8 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500 group"
            onClick={() => !loading && handleRoleSelection("buyer")}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Home className="w-10 h-10 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Buyer</h2>
                <p className="text-slate-600">I'm looking to find and experience homes before making an offer</p>
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection("buyer")
                }}
              >
                {loading ? "Setting up..." : "Continue as Buyer"}
              </Button>
            </div>
          </Card>

          <Card
            className="p-8 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-green-500 group"
            onClick={() => !loading && handleRoleSelection("seller")}
          >
            <div className="text-center space-y-6">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Store className="w-10 h-10 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Seller</h2>
                <p className="text-slate-600">I want to list my property and let buyers experience it virtually</p>
              </div>
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                size="lg"
                disabled={loading}
                onClick={(e) => {
                  e.stopPropagation()
                  handleRoleSelection("seller")
                }}
              >
                {loading ? "Setting up..." : "Continue as Seller"}
              </Button>
            </div>
          </Card>
        </div>

        <p className="text-center text-sm text-slate-500 mt-8">
          Don't worry, you can always change this later in your settings
        </p>
      </div>
    </div>
  )
}
