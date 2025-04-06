import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response object that we can modify
    const res = NextResponse.next()
    
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh the session if it exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('Auth session error:', sessionError)
      // If there's a session error, clear the session and redirect to login
      await supabase.auth.signOut()
      const redirectUrl = new URL('/auth/login', request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Protected routes that require authentication
    const protectedRoutes = ['/dashboard']
    const isProtectedRoute = protectedRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // Auth routes that should redirect to dashboard if logged in
    const authRoutes = ['/auth/login', '/auth/signup']
    const isAuthRoute = authRoutes.some(route => 
      request.nextUrl.pathname.startsWith(route)
    )

    // If accessing a protected route without a session, redirect to login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If logged in and accessing auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // For all other cases, return the response with the refreshed session
    return res
  } catch (e) {
    console.error('Middleware error:', e)
    // On error, proceed with the request but log the error
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 