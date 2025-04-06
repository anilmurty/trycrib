'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'

export default function SignUpForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSignUp = async () => {
    setLoading(true)

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) throw error
      
      // Show verification message instead of redirecting
      setVerificationSent(true)
    } catch (err) {
      console.error('Sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setLoading(true)

    try {
      window.location.href = '/api/auth/google'
    } catch (err) {
      console.error('Google sign up error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (verificationSent) {
    return (
      <div className="space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold text-[#111827]">Welcome to TryCrib</h1>
          <p className="text-sm text-[#6B7280]">Experience your future home before making an offer</p>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl space-y-4">
          <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="#0066FF" strokeWidth="2"/>
              <path d="M12 8V12L15 15" stroke="#0066FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[#111827] mb-1">Check your email!</h3>
            <p className="text-sm text-[#4B5563]">
              We've sent a verification link to <span className="font-medium">{email}</span>
            </p>
          </div>
          <p className="text-sm text-[#6B7280] pt-2">
            Can't find the email? Check your spam folder or{' '}
            <button
              onClick={handleSignUp}
              className="text-[#0066FF] hover:text-[#0052CC] font-medium"
              disabled={loading}
            >
              click here to resend
            </button>
          </p>
        </div>

        <div className="flex justify-center space-x-4">
          <Button
            variant="outline"
            onClick={() => setVerificationSent(false)}
            className="px-6"
          >
            Back
          </Button>
          <Button
            asChild
            className="bg-[#0066FF] hover:bg-[#0052CC] px-6"
          >
            <Link href="/auth/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm text-[#344054]">
            Full Name
          </label>
          <Input
            id="fullName"
            type="text"
            placeholder="John Smith"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm text-[#344054]">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm text-[#344054]">
            Password
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3 py-2"
          />
          <p className="mt-1.5 text-xs text-[#667085]">Password must be at least 6 characters long</p>
        </div>
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
          className="mt-0.5 h-3.5 w-3.5 rounded border-[#D0D5DD] text-[#0066FF]"
        />
        <label htmlFor="terms" className="text-[11px] text-[#667085]">
          By continuing, you agree to TryCrib's{' '}
          <Link href="/terms" className="text-[#0066FF]">Terms of Service</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-[#0066FF]">Privacy Policy</Link>
        </label>
      </div>

      <Button
        onClick={handleSignUp}
        className="h-10 w-full rounded-lg bg-[#0066FF] font-medium text-white"
        disabled={loading || !acceptTerms}
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </Button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#D0D5DD]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-[#FAFAFA] px-4 text-xs text-[#667085]">Or continue with</span>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={handleGoogleSignUp}
        className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white font-normal"
        disabled={loading}
      >
        <div className="flex w-full items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
            <g clipPath="url(#clip0_3502_2546)">
              <path d="M15.4453 8.18332C15.4453 7.64832 15.3973 7.13332 15.3093 6.63332H8.15527V9.45832H12.2453C12.0613 10.4083 11.5333 11.2333 10.7553 11.7833V13.7333H13.2053C14.6493 12.4083 15.4453 10.4833 15.4453 8.18332Z" fill="#4285F4"/>
              <path d="M8.15527 15.6667C10.2053 15.6667 11.9153 14.9917 13.2053 13.7333L10.7553 11.7833C10.0873 12.2333 9.21527 12.5167 8.15527 12.5167C6.18527 12.5167 4.52527 11.2167 3.90527 9.46667H1.37527V11.4667C2.65527 13.9667 5.19527 15.6667 8.15527 15.6667Z" fill="#34A853"/>
              <path d="M3.90527 9.46667C3.74527 9.01667 3.65527 8.51667 3.65527 8C3.65527 7.48333 3.74527 6.98333 3.90527 6.53333V4.53333H1.37527C0.875273 5.58333 0.655273 6.75 0.655273 8C0.655273 9.25 0.875273 10.4167 1.37527 11.4667L3.90527 9.46667Z" fill="#FBBC05"/>
              <path d="M8.15527 3.48333C9.26527 3.48333 10.2653 3.86667 11.0653 4.63333L13.2353 2.46333C11.9153 1.23333 10.2053 0.333328 8.15527 0.333328C5.19527 0.333328 2.65527 2.03333 1.37527 4.53333L3.90527 6.53333C4.52527 4.78333 6.18527 3.48333 8.15527 3.48333Z" fill="#EA4335"/>
            </g>
            <defs>
              <clipPath id="clip0_3502_2546">
                <rect width="16" height="16" fill="white"/>
              </clipPath>
            </defs>
          </svg>
          Google
        </div>
      </Button>
    </div>
  )
} 