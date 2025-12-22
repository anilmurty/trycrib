"use client"

import { useEffect } from "react"
import { useClerk, useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"

export default function SSOCallback() {
  const { handleRedirectCallback } = useClerk()
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleRedirectCallback()
        // After successful OAuth, check if user needs onboarding
        // The /dashboard route will handle redirecting to /onboarding if needed
        router.push("/dashboard")
      } catch (err: any) {
        console.error("[v0] SSO callback error:", err)
        // Check if this is a cancellation (user cancelled OAuth)
        const isCancellation = err?.message?.includes('cancel') || 
                               err?.message?.includes('denied') ||
                               err?.status === 'cancel'
        
        if (isCancellation) {
          console.log("User cancelled OAuth, redirecting to custom auth page")
        }
        
        // Always redirect to custom auth page on any error (including cancel)
        router.push("/auth?tab=login")
      }
    }

    if (isLoaded) {
      handleCallback()
    }
  }, [handleRedirectCallback, router, isLoaded])

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Clerk CAPTCHA element - required for bot protection during OAuth */}
      <div id="clerk-captcha" style={{ display: 'none' }}></div>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-slate-600">Completing sign in...</p>
      </div>
    </div>
  )
}
