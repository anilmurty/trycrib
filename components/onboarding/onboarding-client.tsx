"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Home, Store, UserCheck, Users, ArrowLeft, ArrowRight } from "lucide-react"

interface OnboardingClientProps {
  firstName: string
}

interface AgentInfo {
  name: string
  email: string
  phone: string
}

export function OnboardingClient({ firstName }: OnboardingClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState<"role" | "agent">("role")
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | "seller_agent" | "buyer_agent" | null>(null)
  const [agentInfo, setAgentInfo] = useState<AgentInfo>({
    name: "",
    email: "",
    phone: ""
  })

  const handleRoleSelection = (role: "buyer" | "seller" | "seller_agent" | "buyer_agent") => {
    console.log("=== ONBOARDING CLIENT: Role selection started ===")
    console.log("Selected role:", role)
    
    setSelectedRole(role)
    setError("")

    // If it's an agent role, go directly to dashboard
    if (role === "buyer_agent" || role === "seller_agent") {
      handleCompleteOnboarding(role)
    } else {
      // For buyer/seller, collect agent info first
      setStep("agent")
    }
  }

  const handleCompleteOnboarding = async (role: "buyer" | "seller" | "seller_agent" | "buyer_agent") => {
    setLoading(true)
    setError("")

    try {
      console.log("Making API call to /api/onboarding/set-role")
      const response = await fetch("/api/onboarding/set-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          role,
          agentInfo: (role === "buyer" || role === "seller") ? agentInfo : undefined
        }),
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
      console.error("Error in handleCompleteOnboarding:", err)
      setError("Something went wrong. Please try again.")
      setLoading(false)
    }
  }

  const handleAgentInfoSubmit = () => {
    if (!selectedRole) return

    // Validate agent info
    if (!agentInfo.name.trim() || !agentInfo.email.trim() || !agentInfo.phone.trim()) {
      setError("Please fill in all agent information fields.")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(agentInfo.email)) {
      setError("Please enter a valid email address for your agent.")
      return
    }

    handleCompleteOnboarding(selectedRole)
  }

  const handleBackToRoleSelection = () => {
    setStep("role")
    setSelectedRole(null)
    setAgentInfo({ name: "", email: "", phone: "" })
    setError("")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === "role" ? (
          <>
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
          </>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-slate-900 mb-3">Agent Information</h1>
              <p className="text-xl text-slate-600">
                Please provide your {selectedRole === "buyer" ? "buyer's" : "seller's"} agent information
              </p>
              <p className="text-sm text-slate-500 mt-2">
                We'll use this to connect you with your agent for stay requests and property management
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">{error}</div>
            )}

            <Card className="max-w-2xl mx-auto p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="agentName">Agent Name</Label>
                  <Input
                    id="agentName"
                    type="text"
                    placeholder="John Smith"
                    value={agentInfo.name}
                    onChange={(e) => setAgentInfo({ ...agentInfo, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentEmail">Agent Email</Label>
                  <Input
                    id="agentEmail"
                    type="email"
                    placeholder="john.smith@realestate.com"
                    value={agentInfo.email}
                    onChange={(e) => setAgentInfo({ ...agentInfo, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agentPhone">Agent Phone</Label>
                  <Input
                    id="agentPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={agentInfo.phone}
                    onChange={(e) => setAgentInfo({ ...agentInfo, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleBackToRoleSelection}
                    className="flex-1"
                    disabled={loading}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleAgentInfoSubmit}
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? "Setting up..." : "Continue"}
                    {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
