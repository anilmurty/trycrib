'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleUpdatePassword = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      console.error('Update password error:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">Update your password</h1>
          <p className="text-sm text-[#6B7280]">
            Please enter your new password below.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success ? (
          <div className="bg-green-50 border border-green-100 p-6 rounded-xl space-y-4">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#111827] mb-1">Password updated!</h3>
              <p className="text-sm text-[#4B5563]">
                Redirecting you to login...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm text-[#344054]">
                New password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3 py-2"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-[#344054]">
                Confirm new password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="h-10 rounded-lg border-[#D0D5DD] bg-white px-3 py-2"
              />
            </div>

            <Button
              onClick={handleUpdatePassword}
              className="w-full bg-[#0066FF] hover:bg-[#0052CC]"
              disabled={loading || !password || !confirmPassword}
            >
              {loading ? 'Updating password...' : 'Update password'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 