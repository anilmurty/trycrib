import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[360px] space-y-6 text-center">
        <div className="space-y-2">
          <h1 className="text-[28px] font-bold text-[#111827]">Authentication Error</h1>
          <p className="text-sm text-[#6B7280]">
            There was an error during the authentication process. Please try again.
          </p>
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="h-10 w-full rounded-lg bg-[#0066FF] font-medium text-white"
          >
            <Link href="/auth/login">Return to Login</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="h-10 w-full rounded-lg border border-[#D0D5DD] bg-white font-normal"
          >
            <Link href="/">Go to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
} 