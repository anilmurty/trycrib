"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function DashboardRedirect() {
  const { isSignedIn, isLoaded, userId } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkProfile = async () => {
      if (!isLoaded || !isSignedIn || !userId) {
        if (isLoaded && !isSignedIn) {
          router.push("/auth")
        }
        return
      }

      try {
        const supabase = createClient()
        
        // Add a small delay to allow for profile creation
        await new Promise((resolve) => setTimeout(resolve, 200))
        
        let profile = null
        let retries = 0
        const maxRetries = 5

        while (!profile && retries < maxRetries) {
          const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single()
          
          if (data) {
            profile = data
          } else if (error) {
            console.log("Profile not found, attempt", retries + 1)
            // Wait a bit for profile to be created
            await new Promise((resolve) => setTimeout(resolve, 300))
            retries++
          }
        }

        if (!profile?.role) {
          router.push("/onboarding")
          return
        }

        // Redirect based on user role
        if (profile.role === "seller") {
          router.push("/dashboard/seller")
        } else if (profile.role === "agent") {
          router.push("/dashboard/agent")
        } else if (profile.role === "admin" || profile.role === "superadmin") {
          router.push("/admin")
        } else {
          // Default to buyer dashboard
          router.push("/dashboard/buyer")
        }
      } catch (error) {
        console.error("Error checking profile:", error)
        router.push("/auth")
      } finally {
        setLoading(false)
      }
    }

    checkProfile()
  }, [isLoaded, isSignedIn, userId, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return null
}
