import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')
  const currentDomain = requestUrl.origin

  console.log('Auth Callback - Current domain:', currentDomain)
  console.log('Auth Callback - Request URL:', requestUrl.toString())
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
      
      // If there's a next parameter, redirect there
      if (next) {
        console.log('Auth Callback - Redirecting to next:', next)
        return NextResponse.redirect(new URL(next, currentDomain))
      }

      // Otherwise redirect to the dashboard
      console.log('Auth Callback - Redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', currentDomain))
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