import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    
    // Get the session once and store the result
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Auth session error:', error)
      return res
    }

    // If trying to access a protected route and not logged in, redirect to login
    if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
      const redirectUrl = new URL('/auth/login', request.url)
      redirectUrl.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If logged in and trying to access auth pages, redirect to dashboard
    if (session && (request.nextUrl.pathname.startsWith('/auth/login') || request.nextUrl.pathname.startsWith('/auth/signup'))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return res
  } catch (e) {
    console.error('Middleware error:', e)
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