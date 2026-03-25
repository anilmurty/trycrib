"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import { ContactModal } from "@/components/landing/contact-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/client"

export function Header() {
  const { user, isSignedIn, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [contactModalOpen, setContactModalOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (isSignedIn && user) {
      // Fetch user profile
      supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data)
          }
        })
    }
  }, [isSignedIn, user, supabase])

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (profile?.full_name) {
      const names = profile.full_name.split(" ")
      if (names.length >= 2) {
        return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
    }
      return names[0][0].toUpperCase()
    }
    if (user?.emailAddresses?.[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase()
    }
    return "U"
  }

  const getUserName = () => {
    return profile?.full_name || user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User"
  }

  const getUserEmail = () => {
    return user?.emailAddresses?.[0]?.emailAddress || ""
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="cursor-pointer">
          <Image src="/logo.svg" alt="TryCrib" width={140} height={45} priority />
        </Link>

        {/* Always render nav structure to prevent hydration mismatch */}
          <nav className="hidden items-center gap-8 md:flex">
            {/* Hidden: Browse Properties link */}
            {/* <Link href="/properties" className="text-lg font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
              Browse Properties
            </Link> */}
          {/* Hidden: How it Works link - content moved to homepage */}
          {/* <Link href="/how-it-works" className="text-lg font-medium text-gray-600 hover:text-gray-900 cursor-pointer">
              How it Works
          </Link> */}
          </nav>

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            // Loading state
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : isSignedIn && user ? (
            <>
              <Link href="/dashboard" className="cursor-pointer">
                <Button variant="ghost" className="text-sm text-gray-600 hover:text-gray-900">
                  Dashboard
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl || "/placeholder.svg"} alt={getUserName()} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {getUserName()}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {getUserEmail()}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            // Unauthenticated state
            <>
              <Link href="/#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                How it Works
              </Link>
              <button
                onClick={() => setContactModalOpen(true)}
                className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer"
              >
                Contact
              </button>
              <Link href="/auth?tab=login" className="text-sm text-gray-600 hover:text-gray-900 cursor-pointer">
                Login
              </Link>
              <Link href="/auth?tab=signup" className="cursor-pointer">
                <Button className="rounded-full bg-blue-600 px-6 hover:bg-blue-700">Sign Up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
      <ContactModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
    </header>
  )
}
