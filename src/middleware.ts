import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Create the Supabase client
    const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })
    
    // Refresh the session if it exists
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()

    // Log the current state for debugging (these logs will appear in Vercel)
    console.log('Current path:', request.nextUrl.pathname)
    console.log('Session exists:', !!session)
    console.log('Session error:', sessionError)
    console.log('Session user:', session?.user?.email)

    // Create a response that we'll modify based on the session state
    const response = NextResponse.next()

    if (sessionError) {
      console.error('Auth session error:', sessionError)
      // If there's a session error, clear the session and redirect to login
      await supabase.auth.signOut()
      return NextResponse.redirect(new URL('/auth/login', request.url))
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
      console.log('Redirecting to login: No session for protected route')
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // If logged in and accessing auth routes, redirect to dashboard
    if (session && isAuthRoute) {
      console.log('Redirecting to dashboard: User is logged in')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If logged in and on home page, redirect to dashboard
    if (session && request.nextUrl.pathname === '/') {
      console.log('Redirecting to dashboard: User is logged in and on home page')
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Set the session in the response
    response.cookies.set('supabase-auth-token', session?.access_token || '', {
      path: '/',
      secure: true,
      sameSite: 'lax',
      httpOnly: true
    })

    return response
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