"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { useUser } from "@clerk/nextjs"

export function Footer() {
  const { isSignedIn, isLoaded } = useUser()
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container py-12 md:py-16 px-4 md:px-6">
        {!isLoaded || !isSignedIn ? (
          // Show full footer for non-authenticated users
          <>
            <div className="grid gap-8 md:gap-12 md:grid-cols-2 max-w-2xl mx-auto">
              <div className="text-center">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/how-it-works" className="text-gray-600 hover:text-gray-900">
                      How It Works
                    </Link>
                  </li>
                  <li>
                    <Link href="/verification" className="text-gray-600 hover:text-gray-900">
                      Verification Process
                    </Link>
                  </li>
                  <li>
                    <Link href="/success-stories" className="text-gray-600 hover:text-gray-900">
                      Success Stories
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="text-center">
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/about" className="text-gray-600 hover:text-gray-900">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 md:mt-16 pt-8 border-t text-center">
              <p className="text-sm text-gray-600 mb-4">&copy; 2025 TryCrib. All rights reserved.</p>
              <div className="flex items-center justify-center gap-6">
                <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="https://instagram.com" className="text-gray-500 hover:text-gray-700">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-700">
                  <Twitter className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </>
        ) : (
          // Show simplified footer for authenticated users
          <div className="text-center">
            <div className="flex items-center justify-center gap-6 mb-4">
              <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900">
                Terms of Service
              </Link>
            </div>
            <p className="text-sm text-gray-600 mb-4">&copy; 2025 TryCrib. All rights reserved.</p>
            <div className="flex items-center justify-center gap-6">
              <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-500 hover:text-gray-700">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-700">
                <Twitter className="h-5 w-5" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </footer>
  )
}
