"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Home, Store, UserCheck, Users } from "lucide-react"

interface OnboardingClientProps {
  firstName: string
}

export function OnboardingClient({ firstName }: OnboardingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRoleSelection = async (role: "buyer" | "seller" | "seller_agent" | "buyer_agent") => {
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
      // Redirect to appropriate dashboard based on role
      if (role === "buyer" || role === "buyer_agent") {
        router.push("/dashboard/buyer")
      } else if (role === "seller" || role === "seller_agent") {
        router.push("/dashboard/seller")
      } else {
        router.push("/dashboard")
      }
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
          <p className="text-xl text-slate-600">How would you like to use TryCrib?</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">{error}</div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Buyer */}
          <Card
            className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-blue-500 group"
            onClick={() => !loading && handleRoleSelection("buyer")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                <Home className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Buyer</h2>
                <p className="text-sm text-slate-600">Find and experience homes before making an offer</p>
              </div>
            </div>
          </Card>

          {/* Seller */}
          <Card
            className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-green-500 group"
            onClick={() => !loading && handleRoleSelection("seller")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-500 transition-colors">
                <Store className="w-8 h-8 text-green-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Seller</h2>
                <p className="text-sm text-slate-600">List your property for buyers to experience</p>
              </div>
            </div>
          </Card>

          {/* Buyer's Agent */}
          <Card
            className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-orange-500 group"
            onClick={() => !loading && handleRoleSelection("buyer_agent")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                <Users className="w-8 h-8 text-orange-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Buyer's Agent</h2>
                <p className="text-sm text-slate-600">Help buyers find and experience homes</p>
              </div>
            </div>
          </Card>

          {/* Seller's Agent */}
          <Card
            className="p-6 hover:shadow-xl transition-all cursor-pointer border-2 hover:border-purple-500 group"
            onClick={() => !loading && handleRoleSelection("seller_agent")}
          >
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-500 transition-colors">
                <UserCheck className="w-8 h-8 text-purple-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-2">Seller's Agent</h2>
                <p className="text-sm text-slate-600">Help sellers list and manage their properties</p>
              </div>
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
