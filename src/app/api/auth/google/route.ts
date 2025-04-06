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

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${requestUrl.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error || !data.url) {
      console.error('OAuth error:', error)
      return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
    }

    return NextResponse.redirect(data.url)
  } catch (err) {
    console.error('Server error:', err)
    return NextResponse.redirect(`${new URL(request.url).origin}/auth/auth-code-error`)
  }
} 