import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next')

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    try {
      await supabase.auth.exchangeCodeForSession(code)
    } catch (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/auth-code-error`
      )
    }

    // If there's a next parameter, redirect there
    if (next) {
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    }

    // Otherwise redirect to the dashboard
    return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
  }

  // If no code is present, redirect to auth error page
  return NextResponse.redirect(
    new URL('/auth/auth-code-error', requestUrl.origin)
  )
}

export const dynamic = 'force-dynamic' 