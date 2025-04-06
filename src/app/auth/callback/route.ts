import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const currentDomain = requestUrl.origin

  console.log('Auth Callback - Current domain:', currentDomain)
  console.log('Auth Callback - Request URL:', requestUrl.toString())
  console.log('Auth Callback - All params:', Object.fromEntries(requestUrl.searchParams.entries()))

  // Determine the correct domain for redirects
  let redirectDomain
  if (currentDomain === 'http://localhost:3000') {
    redirectDomain = currentDomain
  } else if (currentDomain === 'https://trycrib.com') {
    redirectDomain = currentDomain
  } else {
    // For Vercel preview deployments, use the preview URL
    redirectDomain = 'https://trycrib-anilmurtys-projects.vercel.app'
  }

  console.log('Auth Callback - Using redirect domain:', redirectDomain)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      console.log('Auth Callback - Exchanging code for session...')
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth Callback - Error exchanging code:', error)
        return NextResponse.redirect(
          `${redirectDomain}/auth/auth-code-error`
        )
      }

      console.log('Auth Callback - Session established:', !!session)
      console.log('Auth Callback - User email:', session?.user?.email)

      // Create response with the correct domain
      const response = NextResponse.redirect(new URL('/dashboard', redirectDomain))

      // Ensure cookies are set with the correct domain
      if (session) {
        const cookieOptions = {
          path: '/',
          secure: true,
          sameSite: 'lax' as const,
          httpOnly: true,
          // Only set domain for production
          domain: redirectDomain === 'https://trycrib.com' ? '.trycrib.com' : undefined
        }

        // Set session cookies
        response.cookies.set('sb-access-token', session.access_token, cookieOptions)
        response.cookies.set('sb-refresh-token', session.refresh_token, cookieOptions)
      }

      return response
    } catch (error) {
      console.error('Auth Callback - Error exchanging code for session:', error)
      return NextResponse.redirect(
        `${redirectDomain}/auth/auth-code-error`
      )
    }
  }

  // If no code is present, redirect to auth error page
  console.log('Auth Callback - No code present, redirecting to error page')
  return NextResponse.redirect(
    new URL('/auth/auth-code-error', redirectDomain)
  )
}

export const dynamic = 'force-dynamic' 