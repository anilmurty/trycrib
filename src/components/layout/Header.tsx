'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          TryCrib
        </Link>

        {/* Navigation - centered */}
        <nav className="flex-1 flex items-center justify-center space-x-8">
          <Link 
            href="/browse" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Browse Properties
          </Link>
          <Link 
            href="/how-it-works" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            How it Works
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/login" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Login
          </Link>
          <Button 
            asChild
            className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white rounded-full px-6"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile menu button - to be implemented */}
        <Button variant="ghost" size="icon" className="md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </Button>
      </div>
    </header>
  );
} 