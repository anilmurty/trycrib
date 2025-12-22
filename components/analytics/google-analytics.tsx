"use client"

import { useEffect } from "react"
import { usePathname, useSearchParams } from "next/navigation"

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  // Initialize Google Analytics
  useEffect(() => {
    if (!gaId) {
      console.warn("Google Analytics ID not found. Set NEXT_PUBLIC_GA_ID in your environment variables.")
      return
    }

    // Load gtag script
    const script1 = document.createElement("script")
    script1.async = true
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`
    document.head.appendChild(script1)

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    window.gtag = gtag as typeof window.gtag

    gtag("js", new Date())
    gtag("config", gaId, {
      page_path: window.location.pathname,
    })

    return () => {
      // Cleanup: remove script if component unmounts
      const existingScript = document.querySelector(`script[src*="googletagmanager.com/gtag/js"]`)
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [gaId])

  // Track page views on route changes
  useEffect(() => {
    if (!gaId || !window.gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    window.gtag("config", gaId, {
      page_path: url,
    })
  }, [pathname, searchParams, gaId])

  if (!gaId) {
    return null
  }

  return null
}
