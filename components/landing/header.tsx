"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"

export function Header() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-gray-900">
          TryCrib
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/properties" className="text-sm text-gray-600 hover:text-gray-900">
            Browse Properties
          </Link>
          <Link href="/how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
            How it Works
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            // Loading state
            <div className="flex items-center gap-3">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : isSignedIn ? (
            // Authenticated state
            <div className="flex items-center gap-3">
              <Link href="/settings">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
              <span className="text-sm text-gray-600">
                Welcome, {user?.firstName || user?.emailAddresses[0]?.emailAddress || "User"}
              </span>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          ) : (
            // Unauthenticated state - keep original auth links
            <>
              <Link href="/auth" className="text-sm text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/auth">
                <Button className="rounded-full bg-blue-600 px-6 hover:bg-blue-700">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
