"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSignIn, useSignUp, useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Header } from "@/components/landing/header"
import Link from "next/link"

export default function AuthPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"login" | "signup">("signup")
  const { isLoaded: signInLoaded, signIn, setActive: setSignInActive } = useSignIn()
  const { isLoaded: signUpLoaded, signUp, setActive: setSignUpActive } = useSignUp()
  const { isSignedIn, isLoaded: userLoaded } = useUser()
  const router = useRouter()

  // Set initial tab based on URL parameter
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'login' || tab === 'signup') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Reset verification state when switching tabs
  useEffect(() => {
    setIsVerificationPending(false)
    setVerificationEmail("")
    setVerificationCode("")
    setIsVerifyingCode(false)
    setVerificationError("")
    setSignUpError("")
    setSignInError("")
  }, [activeTab])

  // Sign Up state
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [signUpError, setSignUpError] = useState("")
  const [signUpLoading, setSignUpLoading] = useState(false)
  
  // Email verification state
  const [isVerificationPending, setIsVerificationPending] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [verificationError, setVerificationError] = useState("")

  // Sign In state
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")
  const [signInError, setSignInError] = useState("")
  const [signInLoading, setSignInLoading] = useState(false)

  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push("/dashboard")
    }
  }, [isSignedIn, userLoaded, router])

  // If still checking auth status or already signed in, show loading
  if (!userLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || isVerificationPending) return

    setSignUpLoading(true)
    setSignUpError("")
    setVerificationError("")

    try {
      const result = await signUp.create({
        emailAddress: signUpEmail,
        password: signUpPassword,
        firstName,
        lastName,
        unsafeMetadata: {
          role: "buyer",
        },
      })

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId })
        router.push("/dashboard")
      } else if (result.status === "missing_requirements") {
        // Email verification required
        if (result.unverifiedFields?.includes("email_address")) {
          setIsVerificationPending(true)
          setVerificationEmail(signUpEmail)
          // Prepare email verification
          await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
        }
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || "An error occurred during sign up"
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("email address taken") || 
          errorMessage.toLowerCase().includes("already exists")) {
        setSignUpError("An account with this email already exists. Please try logging in instead.")
      } else if (errorMessage.toLowerCase().includes("captcha")) {
        setSignUpError("Please complete the security verification and try again.")
      } else {
        setSignUpError(errorMessage)
      }
    } finally {
      setSignUpLoading(false)
    }
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signInLoaded) return

    setSignInLoading(true)
    setSignInError("")

    try {
      const result = await signIn.create({
        identifier: signInEmail,
        password: signInPassword,
      })

      if (result.status === "complete") {
        await setSignInActive({ session: result.createdSessionId })
        router.push("/dashboard")
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.message || "Invalid email or password"
      
      // Handle specific error cases
      if (errorMessage.toLowerCase().includes("email address taken") || 
          errorMessage.toLowerCase().includes("already exists")) {
        setSignInError("An account with this email already exists. Please try logging in instead.")
      } else if (errorMessage.toLowerCase().includes("captcha")) {
        setSignInError("Please complete the security verification and try again.")
      } else {
        setSignInError(errorMessage)
      }
    } finally {
      setSignInLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signUpLoaded || !verificationCode) return

    setIsVerifyingCode(true)
    setVerificationError("")

    try {
      const result = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      })

      if (result.status === "complete") {
        await setSignUpActive({ session: result.createdSessionId })
        router.push("/dashboard")
      }
    } catch (err: any) {
      setVerificationError(err.errors?.[0]?.message || "Invalid verification code")
    } finally {
      setIsVerifyingCode(false)
    }
  }

  const handleResendVerification = async () => {
    if (!signUpLoaded) return

    try {
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" })
      setVerificationError("")
    } catch (err: any) {
      setVerificationError("Failed to resend verification code. Please try again.")
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      if (activeTab === "signup") {
        // For sign up, use signUp.authenticateWithRedirect
        if (!signUpLoaded) return
        
        await signUp.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      } else {
        // For sign in, use signIn.authenticateWithRedirect
        if (!signInLoaded) return
        
        await signIn.authenticateWithRedirect({
          strategy: "oauth_google",
          redirectUrl: "/sso-callback",
          redirectUrlComplete: "/dashboard",
        })
      }
    } catch (err: any) {
      let errorMessage = "An error occurred with Google sign-in"

      // Handle rate limiting specifically
      if (err.status === 429) {
        errorMessage = "Too many requests. Please try again in a bit."
      } else if (err.errors?.[0]?.message) {
        errorMessage = err.errors[0].message
      } else if (err.message) {
        errorMessage = err.message
      }

      if (activeTab === "signup") {
        setSignUpError(errorMessage)
      } else {
        setSignInError(errorMessage)
      }
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome to TryCrib</h1>
          <p className="text-slate-600">Experience your future home before making an offer</p>
        </div>

        <div className="mb-6">
          <div className="flex border-b border-slate-200">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 text-center font-medium transition-colors cursor-pointer ${
                activeTab === "login"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-3 text-center font-medium transition-colors cursor-pointer ${
                activeTab === "signup"
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {activeTab === "signup" ? (
          isVerificationPending ? (
            <div className="space-y-4">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-slate-900 mb-2">Verify your email</h2>
                <p className="text-slate-600">
                  We sent a verification code to <strong>{verificationEmail}</strong>
                </p>
              </div>

              {verificationError && (
                <Alert variant="destructive">
                  <AlertDescription>{verificationError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="verificationCode">Verification Code</Label>
                  <Input
                    id="verificationCode"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isVerifyingCode}>
                  {isVerifyingCode ? "Verifying..." : "Verify Email"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-sm text-blue-600 hover:text-blue-700 underline"
                  >
                    Didn't receive it? Resend verification code
                  </button>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full bg-transparent"
                  onClick={() => {
                    setIsVerificationPending(false)
                    setVerificationEmail("")
                    setVerificationCode("")
                    setVerificationError("")
                  }}
                >
                  Back to sign up
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-4">
              {signUpError && (
                <Alert variant="destructive">
                  <AlertDescription>{signUpError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpEmail">Email</Label>
                <Input
                  id="signUpEmail"
                  type="email"
                  placeholder="you@example.com"
                  value={signUpEmail}
                  onChange={(e) => setSignUpEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signUpPassword">Password</Label>
                <Input
                  id="signUpPassword"
                  type="password"
                  placeholder="••••••••"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  required
                />
              </div>

              {/* CAPTCHA element for Clerk */}
              <div id="clerk-captcha"></div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={signUpLoading}>
                {signUpLoading ? "Creating account..." : "Create Account"}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setActiveTab("login")}
              >
                Already have an account? Log in
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-slate-500">Or continue with</span>
                </div>
              </div>

              <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleGoogleSignIn}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Google
              </Button>

              <p className="text-center text-xs text-slate-500">
                By continuing, you agree to TryCrib's{" "}
                <Link href="/terms" className="underline hover:text-slate-700">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-slate-700">
                  Privacy Policy
                </Link>
              </p>
            </form>
          )
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            {signInError && (
              <Alert variant="destructive">
                <AlertDescription>{signInError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="signInEmail">Email</Label>
              <Input
                id="signInEmail"
                type="email"
                placeholder="you@example.com"
                value={signInEmail}
                onChange={(e) => setSignInEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signInPassword">Password</Label>
              <Input
                id="signInPassword"
                type="password"
                placeholder="••••••••"
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={signInLoading}>
              {signInLoading ? "Signing in..." : "Log In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => setActiveTab("signup")}
            >
              Don't have an account? Sign up
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Or continue with</span>
              </div>
            </div>

            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={handleGoogleSignIn}>
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </form>
        )}
        </div>
      </div>
    </div>
  )
}
