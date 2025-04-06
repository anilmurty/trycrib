'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)
  const supabase = createClientComponentClient()

  const handleResetPassword = async () => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
      })

      if (error) {
        setError(error.message)
        return
      }

      setResetSent(true)
    } catch (err) {
      console.error('Reset password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">Reset your password</h1>
          <p className="text-sm text-[#6B7280]">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {resetSent ? (
          <div className="space-y-6">
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
                  We've sent password reset instructions to <span className="font-medium">{email}</span>
                </p>
              </div>
              <p className="text-sm text-[#6B7280] pt-2">
                Can't find the email? Check your spam folder or{' '}
                <button
                  onClick={handleResetPassword}
                  className="text-[#0066FF] hover:text-[#0052CC] font-medium"
                  disabled={loading}
                >
                  click here to resend
                </button>
              </p>
            </div>

            <Button
              asChild
              className="w-full bg-[#0066FF] hover:bg-[#0052CC]"
            >
              <Link href="/auth/login">Back to Login</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm text-[#344054]">
                Email address
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

            <Button
              onClick={handleResetPassword}
              className="w-full bg-[#0066FF] hover:bg-[#0052CC]"
              disabled={loading || !email}
            >
              {loading ? 'Sending instructions...' : 'Send reset instructions'}
            </Button>

            <div className="text-center">
              <Link
                href="/auth/login"
                className="text-sm text-[#0066FF] hover:text-[#0052CC]"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 