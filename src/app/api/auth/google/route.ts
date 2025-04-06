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

    // Determine the correct callback URL based on the environment
    let redirectTo
    if (currentDomain === 'http://localhost:3000') {
      redirectTo = 'http://localhost:3000/auth/callback'
    } else if (currentDomain === 'https://trycrib.com') {
      redirectTo = 'https://trycrib.com/auth/callback'
    } else {
      // For Vercel preview deployments
      redirectTo = 'https://trycrib-anilmurtys-projects.vercel.app/auth/callback'
    }

    console.log('Google OAuth - Using redirect URL:', redirectTo)

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
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

    // Log the full URL for debugging
    console.log('Google OAuth - Generated URL:', data.url)
    
    // Parse and log the redirect_uri from the generated URL
    const generatedUrl = new URL(data.url)
    console.log('Google OAuth - Parsed redirect_uri:', generatedUrl.searchParams.get('redirect_uri'))

    return NextResponse.redirect(data.url)
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
  }
} 