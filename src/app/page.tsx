import { Hero } from "@/components/layout/Hero";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Property Types */}
      <section className="py-2 md:py-4 bg-gray-50/30 overflow-x-auto">
        <div className="container mx-auto px-2 md:px-4">
          <div className="flex md:grid md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 10h16l-8-7zM4 21h16v-11H4v11z" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Houses</span>
            </button>
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M3 21h18V6H3v15zM8 6v15m4-15v15m4-15v15" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Townhomes</span>
            </button>
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M8 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm6 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-3 4v10m6-10v10M7 11v10" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Multi-family</span>
            </button>
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4 21h16V3H4v18zm3-15h3m-3 4h3m-3 4h3m-3 4h3m4-12h3m-3 4h3m-3 4h3m-3 4h3" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Condos/Co-ops</span>
            </button>
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M5 21h14V3H5v18zm3-15h8M8 9h8m-8 3h8m-8 3h8m-8 3h8" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Apartments</span>
            </button>
            <button className="flex flex-col items-center bg-white rounded-2xl md:rounded-[32px] py-2 md:py-3 px-3 md:px-4 hover:bg-gray-50/80 shadow-[0_1px_2px_rgba(0,0,0,0.08)] min-w-[80px] md:min-w-0">
              <div className="w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 text-gray-600 stroke-[1.25]">
                  <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M12 3L4 9h16l-8-6zM4 9v12h16V9" />
                </svg>
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 mt-1 md:mt-2">Manufactured</span>
            </button>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-8 md:py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-semibold">Featured Properties</h2>
            <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium">View all</a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-[200px] md:h-[240px]">
                <Image
                  src="/images/modern-prairie-estate.jpg"
                  alt="Modern Prairie Estate"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-1">Modern Prairie Estate</h3>
                <p className="text-gray-600 text-sm mb-4">Portland, OR</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <span className="text-xl font-semibold">$1,850,000</span>
                  <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>4 beds</span>
                  <span className="text-gray-300">•</span>
                  <span>3.5 baths</span>
                  <span className="text-gray-300">•</span>
                  <span>3,850 sqft</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-[200px] md:h-[240px]">
                <Image
                  src="/images/contemporary-forest-retreat.jpg"
                  alt="Contemporary Forest Retreat"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-1">Contemporary Forest Retreat</h3>
                <p className="text-gray-600 text-sm mb-4">Vancouver, WA</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <span className="text-xl font-semibold">$1,495,000</span>
                  <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>4 beds</span>
                  <span className="text-gray-300">•</span>
                  <span>3 baths</span>
                  <span className="text-gray-300">•</span>
                  <span>3,200 sqft</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative h-[200px] md:h-[240px]">
                <Image
                  src="/images/waterfront-luxury-villa.jpg"
                  alt="Waterfront Luxury Villa"
                  fill
                  className="object-cover"
                  loading="lazy"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                />
              </div>
              <div className="p-4 md:p-6">
                <h3 className="text-lg font-semibold mb-1">Waterfront Luxury Villa</h3>
                <p className="text-gray-600 text-sm mb-4">Washougal, WA</p>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                  <span className="text-xl font-semibold">$2,995,000</span>
                  <button className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                    View Details
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <span>6 beds</span>
                  <span className="text-gray-300">•</span>
                  <span>5.5 baths</span>
                  <span className="text-gray-300">•</span>
                  <span>6,500 sqft</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-8 md:py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-8 md:mb-16">How TryCrib Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                <span className="text-xl font-semibold">1</span>
              </div>
              <h3 className="text-lg md:text-xl font-medium mb-2 md:mb-3">Browse Properties</h3>
              <p className="text-gray-400 text-sm md:text-base">Search for homes currently on the market that you&apos;re interested in purchasing.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-semibold">2</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Book a Stay</h3>
              <p className="text-gray-400">Reserve a short-term stay to experience living in the home before making an offer.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-xl font-semibold">3</span>
              </div>
              <h3 className="text-xl font-medium mb-3">Make an Informed Decision</h3>
              <p className="text-gray-400">Decide with confidence after experiencing the home, neighborhood, and commute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-3 gap-8 text-center">
            <div>
              <h4 className="font-medium mb-4">Browse</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Browse Properties</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">How It Works</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Verification Process</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">List Your Home</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Requirements</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Seller FAQ</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Success Stories</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">About Us</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Contact</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col items-center space-y-4">
            <p className="text-gray-600 text-sm">&copy; 2025 TryCrib. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Facebook</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Instagram</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-600">
                <span className="sr-only">Twitter</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
