'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import ClicksOverTimeChart from '../../components/ClicksOverTimeChart';
import BrowserDeviceChart from '../../components/BrowserDeviceChart';

interface DetailStatsData {
  slug: string;
  url: string;
  createdAt: string;
  totalClicks: number;
  clicksOverTime: Array<{ timestamp: string; clicks: number }>;
  browserDeviceStats: Array<{ browser: string; device: string; clicks: number }>;
  topReferrers: Array<{ referrer: string; clicks: number }>;
  interval: string;
}

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [stats, setStats] = useState<DetailStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentInterval, setCurrentInterval] = useState('1d');

  const fetchStats = async (interval: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stats/${slug}?interval=${interval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchStats(currentInterval);
    }
  }, [slug, currentInterval]);

  const handleIntervalChange = React.useCallback((interval: string) => {
    setCurrentInterval(interval);
  }, []);

  const formatShortUrl = React.useCallback((slug: string) => {
    return `https://mrrizaldi.me/${slug}`;
  }, []);

  const copyToClipboard = React.useCallback(() => {
    if (stats) {
      navigator.clipboard.writeText(formatShortUrl(stats.slug));
    }
  }, [stats, formatShortUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white pt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white pt-16 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white relative overflow-hidden pt-16">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute top-40 right-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-20 left-1/3 w-24 h-24 bg-blue-150 rounded-full blur-2xl opacity-40"></div>

      <div className="max-w-6xl mx-auto relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
            Link Details
          </h1>
        </div>

        {/* Short Link & QR Code Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <span className="text-2xl mr-2">🔗</span>
                Short Link Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Short URL</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={formatShortUrl(stats.slug)}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-blue-600 font-mono text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Original URL</label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm break-all">
                    <a
                      href={stats.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {stats.url}
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Created</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium">
                      {new Date(stats.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Clicks</label>
                    <div className="px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm font-bold text-blue-700">
                      {stats.totalClicks}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="flex flex-col items-center space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">QR Code</h3>
                <div className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-md">
                  <img
                    src={`/api/qr/${stats.slug}`}
                    alt={`QR Code for ${formatShortUrl(stats.slug)}`}
                    className="w-32 h-32"
                  />
                </div>
                <a
                  href={`/api/qr/${stats.slug}`}
                  download={`qr-${stats.slug}.png`}
                  className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Download QR
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          {/* Clicks Over Time */}
          <div className="xl:col-span-2">
            <ClicksOverTimeChart
              data={stats.clicksOverTime}
              interval={currentInterval}
              onIntervalChange={handleIntervalChange}
            />
          </div>

          {/* Browser & Device Analytics */}
          <div className="xl:col-span-2">
            <BrowserDeviceChart data={stats.browserDeviceStats} />
          </div>
        </div>

        {/* Referrer Stats */}
        {stats.topReferrers.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🔍</span>
              Top Referrers
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Referrer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Clicks
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.topReferrers.map((referrer, index) => {
                    const percentage = ((referrer.clicks / stats.totalClicks) * 100).toFixed(1);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {referrer.referrer || 'Direct'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                          {referrer.clicks}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}