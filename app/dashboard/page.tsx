'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRModal from '../components/QRModal';
import { formatDistanceToNow } from 'date-fns';

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
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; slug: string; shortUrl: string }>({
    isOpen: false,
    slug: '',
    shortUrl: ''
  });

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
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  const formatShortUrl = (slug: string) => {
    return `https://mrrizaldi.me/${slug}`;
  };

  const filteredUrls = urls.filter((url) =>
    url.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openQRModal = (slug: string) => {
    setQrModal({
      isOpen: true,
      slug,
      shortUrl: formatShortUrl(slug)
    });
  };

  const closeQRModal = () => {
    setQrModal({
      isOpen: false,
      slug: '',
      shortUrl: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white relative overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-150 rounded-full blur-2xl opacity-40"></div>

      <div className="max-w-6xl mx-auto relative z-10 px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
            Dashboard
          </h1>
          <p className="text-xl text-gray-600">Manage and track your shortened URLs</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-95 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Links</h3>
                <p className="text-3xl font-bold text-blue-600">{urls.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">🔗</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-95 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Clicks</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {urls.reduce((sum, url) => sum + url.hitCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👆</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6 backdrop-blur-sm bg-opacity-95 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Clicks</h3>
                <p className="text-3xl font-bold text-blue-600">
                  {urls.length > 0 ? Math.round(urls.reduce((sum, url) => sum + url.hitCount, 0) / urls.length) : 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>
        </div>

        {/* Your Links Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm bg-opacity-95 border border-white/20">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-3">📋</span>
              Your Links
            </h2>

            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="🔍 Search by slug or original URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 text-gray-800 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all duration-200 bg-gray-50 focus:bg-white"
              />
            </div>
          </div>

          {isLoadingUrls ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-3 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="text-lg">Loading your links...</span>
              </div>
            </div>
          ) : filteredUrls.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm ? 'No matching links found' : 'No links yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm ? 'Try adjusting your search term' : 'Create your first short link to get started'}
              </p>
              {!searchTerm && (
                <Link
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  🚀 Create First Link
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-lg">
              <div className="overflow-x-auto max-h-96">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-blue-50 to-blue-100 sticky top-0">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Short URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Original URL
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-blue-700 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredUrls.map((url) => (
                      <tr key={url.slug} className="hover:bg-blue-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={formatShortUrl(url.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm flex items-center"
                          >
                            🔗 {formatShortUrl(url.slug)}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 max-w-xs truncate font-medium" title={url.originalUrl}>
                            {url.originalUrl}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                          {formatDate(url.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => openQRModal(url.slug)}
                            className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                            title="View QR Code"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/dashboard/${url.slug}`}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md hover:shadow-lg"
                          >
                            📊 Details
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

      {/* QR Code Modal */}
      <QRModal
        isOpen={qrModal.isOpen}
        onClose={closeQRModal}
        slug={qrModal.slug}
        shortUrl={qrModal.shortUrl}
      />
    </div>
  );
}