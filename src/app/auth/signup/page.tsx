'use client'

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import SignInForm from '@/components/auth/SignInForm'
import SignUpForm from '@/components/auth/SignUpForm'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAFAFA]">
      <div className="w-full max-w-[360px] space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-[28px] font-bold text-[#111827]">Welcome to TryCrib</h1>
          <p className="text-sm text-[#6B7280]">Experience your future home before making an offer</p>
        </div>

        <Tabs defaultValue="signup" className="w-full">
          <TabsList>
            <TabsTrigger value="login" className="flex-1">Log In</TabsTrigger>
            <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <SignInForm />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 