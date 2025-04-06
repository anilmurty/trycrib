import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { CookieOptions } from '@supabase/ssr'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        cookies: {
          get(name: string) {
            return request.headers.get('cookie')?.split('; ').find(row => row.startsWith(`${name}=`))?.split('=')[1]
          },
          set(name: string, value: string, options: CookieOptions) {
            // The cookie will be set by the middleware
          },
          remove(name: string, options: CookieOptions) {
            // The cookie will be removed by the middleware
          },
        },
        /* eslint-enable @typescript-eslint/no-unused-vars */
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(requestUrl.origin)
    }
  }

  // Return the user to an error page with instructions
  return NextResponse.redirect(`${requestUrl.origin}/auth/auth-code-error`)
} 