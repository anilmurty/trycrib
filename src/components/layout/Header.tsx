'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Button } from '@/components/ui/button';
import { User } from '@supabase/supabase-js';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    // Function to get and verify user session
    const getUserSession = async () => {
      try {
        console.log('Header - Checking session...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Header - Session check result:', {
          hasSession: !!session,
          sessionError,
          userEmail: session?.user?.email
        });

        if (sessionError) {
          console.error('Header - Session error:', sessionError);
          setUser(null);
          return;
        }

        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Header - Auth error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial session check
    getUserSession();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Header - Auth state change:', { event, userEmail: session?.user?.email });
      
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      console.log('Header - Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Header - Sign out error:', error);
        return;
      }

      console.log('Header - Sign out successful');
      // Force a page reload to clear all state, using current domain
      const currentDomain = window.location.origin;
      window.location.href = currentDomain;
    } catch (error) {
      console.error('Header - Sign out error:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-semibold">
            TryCrib
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="text-xl font-semibold">
          TryCrib
        </Link>

        {/* Desktop Navigation - hidden on mobile */}
        <nav className="hidden md:flex items-center justify-center space-x-8">
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

        {/* Desktop Auth buttons - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Dashboard
              </Link>
              <Button 
                onClick={handleSignOut}
                variant="outline"
                className="border-[#D0D5DD] hover:bg-[#0066FF] hover:text-white hover:border-[#0066FF] cursor-pointer"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link 
                href="/auth/login" 
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Login
              </Link>
              <Button 
                asChild
                className="bg-[#0066FF] hover:bg-[#0066FF]/90 text-white rounded-full px-6"
              >
                <Link href="/auth/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/20 z-40 md:hidden" onClick={() => setIsMenuOpen(false)} />
      )}

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <span className="text-xl font-semibold">Menu</span>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 -mr-2 text-gray-600"
            aria-label="Close menu"
          >
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
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-4">
          <Link 
            href="/browse" 
            className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Browse Properties
          </Link>
          <Link 
            href="/how-it-works" 
            className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            How it Works
          </Link>
          <div className="pt-4 border-t border-gray-200">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button 
                  onClick={() => {
                    handleSignOut()
                    setIsMenuOpen(false)
                  }}
                  variant="outline"
                  className="w-full mt-2 border-[#D0D5DD] hover:bg-[#0066FF] hover:text-white hover:border-[#0066FF] cursor-pointer"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link 
                  href="/auth/login" 
                  className="block text-gray-600 hover:text-gray-900 transition-colors py-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Button 
                  asChild
                  className="w-full mt-2 bg-[#0066FF] hover:bg-[#0066FF]/90 text-white rounded-full"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Link href="/auth/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
} 