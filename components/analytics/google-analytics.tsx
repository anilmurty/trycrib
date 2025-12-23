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

  // Track page views on route changes (script is loaded via Next.js Script component)
  useEffect(() => {
    if (!gaId || typeof window === "undefined" || !window.gtag) return

    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "")

    window.gtag("config", gaId, {
      page_path: url,
      send_page_view: true,
    })
  }, [pathname, searchParams, gaId])

  return null
}
