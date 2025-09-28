'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
              <span className={`text-xl sm:text-2xl font-bold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'
                  : 'text-gray-800 drop-shadow-sm'
              }`}>
                <span className="hidden sm:inline">mrrizaldi's</span>
                <span className="sm:hidden">mrrizaldi's</span>
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden sm:flex items-center space-x-2">
            <Link
              href="/"
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                  : isScrolled 
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-gray-800 hover:bg-gray-200/50 drop-shadow-sm'
              }`}
            >
              <span className="hidden lg:inline">🚀 Create</span>
              <span className="lg:hidden">🚀</span>
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-2 lg:px-4 lg:py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname && pathname.startsWith('/dashboard')
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                  : isScrolled 
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-gray-800 hover:bg-gray-200/50 drop-shadow-sm'
              }`}
            >
              <span className="hidden lg:inline">📊 Dashboard</span>
              <span className="lg:hidden">📊</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-200 ${
                isScrolled 
                  ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  : 'text-gray-800 hover:bg-gray-200/50'
              }`}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div className={`sm:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-40 pb-4' : 'max-h-0'
        }`}>
          <div className={`space-y-2 pt-2 px-2 pb-2 mx-2 rounded-xl transition-all duration-300 ${
            isScrolled 
              ? 'bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg'
              : 'bg-white/90 backdrop-blur-md border border-white/30 shadow-xl'
          }`}>
            <Link
              href="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                pathname === '/'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🚀 Create Short Link
            </Link>
            <Link
              href="/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                pathname && pathname.startsWith('/dashboard')
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-md'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard & Analytics
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}