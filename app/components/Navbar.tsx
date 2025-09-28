'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

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
            <Button
              asChild
              variant={pathname === '/' ? "default" : "ghost"}
              size="sm"
              className={pathname === '/' ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : ""}
            >
              <Link href="/">
                <span className="hidden lg:inline">🚀 Create</span>
                <span className="lg:hidden">🚀</span>
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname && pathname.startsWith('/dashboard') ? "default" : "ghost"}
              size="sm"
              className={pathname && pathname.startsWith('/dashboard') ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : ""}
            >
              <Link href="/dashboard">
                <span className="hidden lg:inline">📊 Dashboard</span>
                <span className="lg:hidden">📊</span>
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </Button>
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
            <Button
              asChild
              variant={pathname === '/' ? "default" : "ghost"}
              className={`w-full justify-start ${pathname === '/' ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link href="/">
                🚀 Create Short Link
              </Link>
            </Button>
            <Button
              asChild
              variant={pathname && pathname.startsWith('/dashboard') ? "default" : "ghost"}
              className={`w-full justify-start ${pathname && pathname.startsWith('/dashboard') ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Link href="/dashboard">
                📊 Dashboard & Analytics
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}