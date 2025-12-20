"use client"

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"

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
          <p className="text-sm text-gray-600 mb-4">&copy; 2025 Metabuilder LLC. All Rights Reserved.</p>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            <Link href="https://facebook.com" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Facebook className="h-5 w-5" />
            </Link>
            <Link href="https://instagram.com" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="https://twitter.com" className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
