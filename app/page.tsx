'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [originalUrl, setOriginalUrl] = useState('');
  const [customSlug, setCustomSlug] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          customSlug: customSlug || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to shorten URL');
      }

      setShortUrl(data.shortUrl);
      setOriginalUrl('');
      setCustomSlug('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white relative overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-150 rounded-full blur-2xl opacity-40"></div>

      <div className="max-w-2xl mx-auto relative z-10 px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium mb-6">
            🚀 Fast & Secure URL Shortening
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-6">
            URL Shortener
          </h1>
          <p className="text-xl text-gray-600 max-w-xl mx-auto leading-relaxed">
            Transform long URLs into short, shareable links with detailed analytics and tracking
          </p>
        </div>

        {/* Main Form */}
        <Card className="backdrop-blur-sm bg-opacity-95 border-white/20">
          <CardHeader>
            <div className="flex items-center mb-2">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full mr-4"></div>
              <CardTitle className="text-2xl font-bold text-gray-800">Create Short Link</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="originalUrl" className="text-sm font-semibold text-gray-700">
                  🌐 Original URL
                </Label>
                <Input
                  type="url"
                  id="originalUrl"
                  value={originalUrl}
                  onChange={(e) => setOriginalUrl(e.target.value)}
                  placeholder="https://example.com/your-very-long-url-that-needs-shortening"
                  required
                  className="text-lg border-2 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customSlug" className="text-sm font-semibold text-gray-700">
                  ✨ Custom Slug <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  type="text"
                  id="customSlug"
                  value={customSlug}
                  onChange={(e) => setCustomSlug(e.target.value)}
                  placeholder="my-awesome-link"
                  className="text-lg border-2 focus:ring-4 focus:ring-blue-500/10"
                />
                <p className="text-sm text-gray-500 flex items-center">
                  💡 Leave empty to auto-generate a unique slug
                </p>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white text-lg font-bold px-8 py-4 h-auto hover:from-blue-700 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Shortening...
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    ⚡ Shorten URL
                  </span>
                )}
              </Button>
            </form>

            {error && (
              <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-xl">
                <div className="flex items-center">
                  <span className="text-red-400 text-xl mr-3">❌</span>
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            {shortUrl && (
              <div className="mt-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400 rounded-r-xl">
                <div className="flex items-center mb-3">
                  <span className="text-green-500 text-xl mr-3">🎉</span>
                  <p className="text-green-800 font-bold">Your short URL is ready!</p>
                </div>
                <div className="flex items-center gap-3">
                  <Input
                    type="text"
                    value={shortUrl}
                    readOnly
                    className="flex-1 bg-white border-2 border-green-200 text-blue-600 font-mono text-sm"
                  />
                  <Button
                    onClick={copyToClipboard}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    📋 Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-blue-700">How it works</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">1.</span>
                <span>Paste your long URL into the form above</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">2.</span>
                <span>Optionally customize your short link slug</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">3.</span>
                <span>Click "Shorten URL" and get your shareable link instantly</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-blue-600 mr-2">4.</span>
                <span>Track clicks and analytics in the Dashboard</span>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}