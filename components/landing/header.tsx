"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Header() {
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
          <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900">
            Login
          </Link>
          <Link href="/sign-up">
            <Button className="rounded-full bg-blue-600 px-6 hover:bg-blue-700">Sign Up</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
