import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const currentDomain = requestUrl.origin

  console.log('Auth Callback - Current domain:', currentDomain)
  console.log('Auth Callback - Request URL:', requestUrl.toString())
  console.log('Auth Callback - Request headers:', Object.fromEntries(request.headers.entries()))
  console.log('Auth Callback - Code present:', !!code)

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      console.log('Auth Callback - Exchanging code for session...')
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Auth Callback - Error exchanging code:', error)
        return NextResponse.redirect(
          `${currentDomain}/auth/auth-code-error`
        )
      }

      console.log('Auth Callback - Session established:', !!session)
      
      // Create a response that we'll modify
      const response = NextResponse.redirect(new URL('/dashboard', currentDomain))
      
      // Set the session cookie explicitly
      if (session) {
        response.cookies.set('sb-access-token', session.access_token, {
          path: '/',
          secure: true,
          sameSite: 'lax',
          httpOnly: true
        })
        response.cookies.set('sb-refresh-token', session.refresh_token, {
          path: '/',
          secure: true,
          sameSite: 'lax',
          httpOnly: true
        })
      }

      console.log('Auth Callback - Redirecting to dashboard')
      return response
    } catch (error) {
      console.error('Auth Callback - Error exchanging code for session:', error)
      return NextResponse.redirect(
        `${currentDomain}/auth/auth-code-error`
      )
    }
  }

  // If no code is present, redirect to auth error page
  console.log('Auth Callback - No code present, redirecting to error page')
  return NextResponse.redirect(
    new URL('/auth/auth-code-error', currentDomain)
  )
}

export const dynamic = 'force-dynamic' 