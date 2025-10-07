"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export function Footer() {
  const { isSignedIn, isLoaded } = useUser()
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        {!isLoaded || !isSignedIn ? (
          // Show full footer for non-authenticated users
          <>
            <div className="grid gap-6 sm:gap-8 md:gap-12 grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto">
              <div className="text-center">
                <ul className="space-y-2 sm:space-y-3 text-sm">
                  <li>
                    <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/verification" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Verification Process
                    </Link>
                  </li>
                  <li>
                    <Link href="/success-stories" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Success Stories
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <ul className="space-y-2 sm:space-y-3 text-sm">
                  <li>
                    <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-8 sm:mt-12 md:mt-16 pt-6 sm:pt-8 border-t text-center">
              <p className="text-sm text-gray-600 mb-4">&copy; 2025 TryCrib. All rights reserved.</p>
              <div className="flex items-center justify-center gap-4 sm:gap-6">
                <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="https://instagram.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          // Show simplified footer for authenticated users
          <div className="text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">&copy; 2025 TryCrib. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 sm:gap-6">
              <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-700 transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}
