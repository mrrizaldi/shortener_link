'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200 group-hover:scale-105">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
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
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              🚀 Create
            </Link>
            <Link
              href="/dashboard"
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                pathname && pathname.startsWith('/dashboard')
                  ? 'text-white bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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