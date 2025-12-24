import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/admin(.*)",
  "/settings(.*)",
  "/onboarding(.*)",
])

// Exclude Clerk's error pages and auth routes from protection
const isAuthRoute = createRouteMatcher([
  "/auth(.*)",
  "/sso-callback(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, request) => {
  // Skip protection for auth routes
  if (isAuthRoute(request)) {
    return NextResponse.next()
  }

  if (isProtectedRoute(request)) {
    try {
      await auth.protect({
        unauthenticatedUrl: "/auth?tab=login",
      })
    } catch (error: any) {
      // NEXT_REDIRECT is Clerk's way of handling redirects
      // The digest format is: 'NEXT_REDIRECT;replace;/auth?tab=login;307;'
      if (error?.digest?.includes('NEXT_REDIRECT') || error?.clerk_digest === 'CLERK_PROTECT_REDIRECT_TO_URL') {
        // Extract redirect URL from error or use default
        const redirectUrl = error?.redirectUrl || '/auth?tab=login'
        return NextResponse.redirect(new URL(redirectUrl, request.url))
      }
      
      // Handle cancellation and other auth errors gracefully
      // Redirect to auth page instead of throwing 500 error
      console.error("Middleware auth error:", error)
      
      // Check if this is a cancellation or unauthenticated error
      const isCancellation = error?.message?.includes('cancel') || 
                            error?.message?.includes('denied') ||
                            error?.status === 'unauthenticated' ||
                            error?.code === 'unauthenticated'
      
      if (isCancellation) {
        // User cancelled or is unauthenticated - redirect to auth page
        return NextResponse.redirect(new URL('/auth?tab=login', request.url))
      }
      
      // For other errors, still redirect to auth page to avoid 500
      return NextResponse.redirect(new URL('/auth?tab=login', request.url))
    }
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
}
