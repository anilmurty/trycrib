import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from "@clerk/nextjs"
import { Suspense } from "react"
import Script from "next/script"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import "./globals.css"

export const metadata: Metadata = {
  title: "TryCrib",
  description: "Try before you buy - Experience homes before making an offer",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID

  return (
      <html lang="en">
        <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
        {/* Clerk CAPTCHA element - required for bot protection, available globally */}
        <div id="clerk-captcha" style={{ display: 'none' }}></div>
        <ClerkProvider
          signInUrl="/auth?tab=login"
          signUpUrl="/auth?tab=signup"
          afterSignInUrl="/dashboard"
          afterSignUpUrl="/onboarding"
          fallbackRedirectUrl="/auth"
        >
          <Suspense fallback={null}>
            <GoogleAnalytics />
            {children}
          </Suspense>
          <Analytics />
        </ClerkProvider>
        </body>
      </html>
  )
}
