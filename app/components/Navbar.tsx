'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);

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
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className={`text-2xl font-bold transition-all duration-300 ${
                isScrolled 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent'
                  : 'text-gray-800 drop-shadow-sm'
              }`}>
                Shortener
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname === '/'
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                  : isScrolled 
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-gray-800 hover:bg-gray-200/50 drop-shadow-sm'
              }`}
            >
              🚀 Create
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname && pathname.startsWith('/dashboard')
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                  : isScrolled 
                    ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    : 'text-gray-800 hover:bg-gray-200/50 drop-shadow-sm'
              }`}
            >
              📊 Dashboard
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}