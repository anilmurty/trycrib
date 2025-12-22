/**
 * Google Analytics utility functions for tracking custom events
 */

declare global {
  interface Window {
    gtag: (
      command: string,
      targetId: string,
      config?: Record<string, any>
    ) => void
  }
}

/**
 * Track a custom event in Google Analytics
 */
export function trackEvent(
  eventName: string,
  eventParams?: {
    category?: string
    label?: string
    value?: number
    [key: string]: any
  }
) {
  if (typeof window === "undefined" || !window.gtag) {
    return
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) {
    return
  }

  window.gtag("event", eventName, {
    ...eventParams,
  })
}

/**
 * Track page view manually (usually handled automatically by GoogleAnalytics component)
 */
export function trackPageView(path: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return
  }

  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) {
    return
  }

  window.gtag("config", gaId, {
    page_path: path,
  })
}

/**
 * Common event tracking functions
 */
export const analytics = {
  // Authentication events
  signUp: (method: "email" | "google") => {
    trackEvent("sign_up", {
      method,
      category: "authentication",
    })
  },
  signIn: (method: "email" | "google") => {
    trackEvent("login", {
      method,
      category: "authentication",
    })
  },
  signOut: () => {
    trackEvent("sign_out", {
      category: "authentication",
    })
  },

  // Property events
  viewProperty: (propertyId: string) => {
    trackEvent("view_item", {
      item_id: propertyId,
      category: "property",
    })
  },
  requestListing: (address: string) => {
    trackEvent("request_listing", {
      label: address,
      category: "property",
    })
  },
  claimProperty: (propertyId: string) => {
    trackEvent("claim_property", {
      item_id: propertyId,
      category: "property",
    })
  },

  // Booking events
  requestStay: (propertyId: string) => {
    trackEvent("request_stay", {
      item_id: propertyId,
      category: "booking",
    })
  },
  completeBooking: (propertyId: string, value?: number) => {
    trackEvent("purchase", {
      item_id: propertyId,
      value,
      category: "booking",
    })
  },

  // Onboarding events
  completeOnboarding: (role: string) => {
    trackEvent("complete_onboarding", {
      label: role,
      category: "onboarding",
    })
  },

  // Navigation events
  clickCTA: (ctaName: string, location: string) => {
    trackEvent("click_cta", {
      label: ctaName,
      location,
      category: "navigation",
    })
  },
}
