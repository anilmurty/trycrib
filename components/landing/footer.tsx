"use client"

import Link from "next/link"
import { Facebook, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="mx-auto max-w-7xl py-8 sm:py-12 md:py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 mb-4">
            <Link href="/privacy" className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
              Terms of Service
            </Link>
          </div>
          <p className="text-sm text-gray-600 mb-4">&copy; 2026 Metabuilder LLC. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="https://www.linkedin.com/company/try-crib/" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/try_crib" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
