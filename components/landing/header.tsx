"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useUser, useClerk } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { LogOut, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function Header() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase()
    }
    if (user?.emailAddresses[0]?.emailAddress) {
      return user.emailAddresses[0].emailAddress[0].toUpperCase()
    }
    return "U"
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-3xl font-bold text-gray-900 cursor-pointer">
          TryCrib
        </Link>

        {!isSignedIn && (
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
        )}

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            // Loading state
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          ) : isSignedIn ? (
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
                      <AvatarImage src={user?.imageUrl || "/placeholder.svg"} alt={user?.firstName || "User"} />
                      <AvatarFallback className="bg-blue-600 text-white text-sm">{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.firstName && user?.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user?.firstName || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.emailAddresses[0]?.emailAddress}
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
            // Unauthenticated state - keep original auth links
            <>
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
    </header>
  )
}
