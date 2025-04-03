'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';

interface TabContent {
  title: string;
  subtitle: string;
  carouselImages: string[];
}

interface Content {
  buyers: TabContent;
  sellers: TabContent;
}

export function Hero() {
  const [activeTab, setActiveTab] = useState<'buyers' | 'sellers'>('buyers');
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const content: Content = {
    buyers: {
      title: "Try Your Future Home\nBefore You Buy",
      subtitle: "Experience living in your potential new home before making an offer.\nThe perfect way to ensure it's the right fit for you.",
      carouselImages: [
        '/images/buyer-carousel/buyer-carousel-1.jpg',
        '/images/buyer-carousel/buyer-carousel-2.jpg',
        '/images/buyer-carousel/buyer-carousel-4.jpg'
      ]
    },
    sellers: {
      title: "List Your Property for\nTry-Before-You-Buy",
      subtitle: "Let potential buyers experience your property firsthand.\nIncrease serious offers and reduce time-wasting viewings.",
      carouselImages: [
        '/images/seller-carousel/Seller-Carousel-1.jpg',
        '/images/seller-carousel/Seller-Carousel-2.jpg',
        '/images/seller-carousel/Seller-Carousel-3.jpg'
      ]
    }
  };

  // Auto-advance carousel every 3 seconds
  useEffect(() => {
    if (!emblaApi) return;

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext();
      } else {
        emblaApi.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  // Update selected index for dots
  useEffect(() => {
    if (!emblaApi) return;
    
    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on('select', onSelect);
    onSelect();

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="relative h-[400px] sm:h-[500px] md:h-[600px] w-full flex items-center justify-center overflow-hidden">
      {/* Background Carousel */}
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {content[activeTab].carouselImages.map((src, index) => (
            <div
              key={index}
              className="relative flex-[0_0_100%] min-w-0 h-full"
            >
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              {/* Dark overlay for better text readability */}
              <div className="absolute inset-0 bg-black/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-20 container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center text-white mb-4 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold mb-2 md:mb-4 hero-text-shadow whitespace-pre-line">
            {content[activeTab].title}
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl opacity-90 hero-text-shadow whitespace-pre-line">
            {content[activeTab].subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Tabs */}
          <div className="flex justify-center mb-3 md:mb-6 space-x-2">
            <button
              className={`px-3 sm:px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-colors min-w-[90px] sm:min-w-[100px] ${
                activeTab === 'buyers'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-gray-600 hover:bg-opacity-90'
              }`}
              onClick={() => setActiveTab('buyers')}
            >
              For Buyers
            </button>
            <button
              className={`px-3 sm:px-4 md:px-6 py-2 rounded-full text-sm font-medium transition-colors min-w-[90px] sm:min-w-[100px] ${
                activeTab === 'sellers'
                  ? 'bg-[#0066FF] text-white'
                  : 'bg-white text-gray-600 hover:bg-opacity-90'
              }`}
              onClick={() => setActiveTab('sellers')}
            >
              For Sellers
            </button>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-lg">
            {activeTab === 'buyers' ? (
              <div className="p-2 md:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Where are you looking?"
                    className="w-full pl-8 sm:pl-10 pr-3 py-2.5 text-sm md:text-base rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Check in"
                    className="w-full pl-8 sm:pl-10 pr-3 py-2.5 text-sm md:text-base rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => {
                      e.target.type = 'text';
                      if (!e.target.value) e.target.placeholder = 'Check in';
                    }}
                  />
                </div>
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Check out"
                    className="w-full pl-8 sm:pl-10 pr-3 py-2.5 text-sm md:text-base rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                    onFocus={(e) => e.target.type = 'date'}
                    onBlur={(e) => {
                      e.target.type = 'text';
                      if (!e.target.value) e.target.placeholder = 'Check out';
                    }}
                  />
                </div>
                <button className="bg-[#0066FF] text-white px-4 py-2.5 rounded-md text-sm md:text-base font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto">
                  Search
                </button>
              </div>
            ) : (
              <div className="p-2 md:p-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 relative">
                  <svg
                    className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Enter your property address"
                    className="w-full pl-8 sm:pl-10 pr-3 py-2.5 text-sm md:text-base rounded-md border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-gray-900 placeholder:text-gray-500"
                  />
                </div>
                <button className="bg-[#0066FF] text-white px-4 py-2.5 rounded-md text-sm md:text-base font-medium hover:bg-blue-700 transition-colors w-full sm:w-auto whitespace-nowrap">
                  List Property
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Carousel Navigation Dots */}
      <div className="absolute bottom-3 sm:bottom-6 left-0 right-0 z-30 flex justify-center space-x-1.5 sm:space-x-2">
        {content[activeTab].carouselImages.map((_, index) => (
          <button
            key={index}
            className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-colors ${
              index === selectedIndex
                ? 'bg-white'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => emblaApi?.scrollTo(index)}
          />
        ))}
      </div>
    </div>
  );
} 