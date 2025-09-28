'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UrlRecord {
  slug: string;
  originalUrl: string;
  hitCount: number;
  createdAt: string;
}

export default function Dashboard() {
  const [urls, setUrls] = useState<UrlRecord[]>([]);
  const [isLoadingUrls, setIsLoadingUrls] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchUrls = async () => {
    try {
      const response = await fetch('/api/urls');
      if (response.ok) {
        const data = await response.json();
        setUrls(data);
      }
    } catch (err) {
      console.error('Error fetching URLs:', err);
    } finally {
      setIsLoadingUrls(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatShortUrl = (slug: string) => {
    return `${window.location.origin}/${slug}`;
  };

  const filteredUrls = urls.filter((url) =>
    url.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-blue-700 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage and track your shortened URLs</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Links</h3>
          <p className="text-3xl font-bold text-blue-700">{urls.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
          <p className="text-3xl font-bold text-blue-700">
            {urls.reduce((sum, url) => sum + url.hitCount, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Clicks</h3>
          <p className="text-3xl font-bold text-blue-700">
            {urls.length > 0 ? Math.round(urls.reduce((sum, url) => sum + url.hitCount, 0) / urls.length) : 0}
          </p>
        </div>
      </div>

      {/* Your Links Section */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">Your Links</h2>

          {/* Search Bar */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by slug or original URL..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-2 border-gray-300 text-lg px-4 py-2 rounded-md w-full max-w-md focus:border-blue-500 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {isLoadingUrls ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading your links...</span>
            </div>
          </div>
        ) : filteredUrls.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No matching links found' : 'No links yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first short link to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Short URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Original URL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Analytics
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUrls.map((url) => (
                    <tr key={url.slug} className="hover:bg-blue-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={formatShortUrl(url.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline font-medium text-sm"
                        >
                          {formatShortUrl(url.slug)}
                        </a>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate" title={url.originalUrl}>
                          {url.originalUrl}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {url.hitCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(url.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/${url.slug}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm"
                        >
                          View Analytics
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}