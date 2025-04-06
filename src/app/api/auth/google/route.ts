import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ 
      cookies: () => cookieStore 
    })

    // Get the current domain and ensure it's used for the callback
    const currentDomain = requestUrl.origin
    console.log('Google OAuth - Current domain:', currentDomain)
    console.log('Google OAuth - Request URL:', requestUrl.toString())
    console.log('Google OAuth - Request headers:', Object.fromEntries(request.headers.entries()))

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${currentDomain}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error || !data.url) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${currentDomain}/auth/auth-code-error`)
    }

    console.log('Google OAuth - Generated URL:', data.url)
    console.log('Google OAuth - URL components:', {
      protocol: new URL(data.url).protocol,
      host: new URL(data.url).host,
      pathname: new URL(data.url).pathname,
      search: new URL(data.url).search
    })

    // Force the redirect URL to use the current domain
    const redirectUrl = new URL(data.url)
    redirectUrl.searchParams.set('redirect_uri', `${currentDomain}/auth/callback`)
    console.log('Google OAuth - Modified redirect URL:', redirectUrl.toString())

    return NextResponse.redirect(redirectUrl.toString())
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
  }
} 