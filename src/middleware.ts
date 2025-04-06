import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create a response that we'll modify based on the session state
    const res = NextResponse.next()

    // Create the Supabase client with the response we'll modify
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Refresh the session if it exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Log the current state for debugging (these logs will appear in Vercel)
    console.log('Middleware - URL:', request.url)
    console.log('Middleware - Path:', request.nextUrl.pathname)
    console.log('Middleware - Session exists:', !!session)
    console.log('Middleware - Session user:', session?.user?.email)
    console.log('Middleware - Session error:', sessionError)
    console.log('Middleware - Cookies:', request.cookies.toString())

    if (sessionError) {
      console.error('Middleware - Auth session error:', sessionError)
      // If there's a session error, clear the session and redirect to login
      await supabase.auth.signOut()
      const loginUrl = new URL('/auth/login', request.url)
      console.log('Middleware - Redirecting to:', loginUrl.toString())
      return NextResponse.redirect(loginUrl)
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
      console.log('Middleware - Redirecting to login: No session for protected route')
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(loginUrl)
    }

    // If logged in and accessing auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      console.log('Middleware - Redirecting to dashboard: User is logged in')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If logged in and on home page, redirect to dashboard
    if (session && request.nextUrl.pathname === '/') {
      console.log('Middleware - Redirecting to dashboard: User is logged in and on home page')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Return the response with the session
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