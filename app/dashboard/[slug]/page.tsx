'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
);

interface StatsData {
  slug: string;
  totalClicks: number;
  clicksPerDay: Array<{ date: string; clicks: number }>;
  topReferrers: Array<{ referrer: string; clicks: number }>;
  topUserAgents: Array<{ userAgent: string; clicks: number }>;
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats/${slug}`);
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

    if (slug) {
      fetchStats();
    }
  }, [slug]);

  const formatUserAgent = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Mobile')) return 'Mobile';
    return 'Other';
  };

  const processUserAgents = (userAgents: Array<{ userAgent: string; clicks: number }>) => {
    const browserMap = new Map<string, number>();

    userAgents.forEach(({ userAgent, clicks }) => {
      const browser = formatUserAgent(userAgent);
      const currentClicks = browserMap.get(browser) || 0;
      browserMap.set(browser, currentClicks + clicks);
    });

    return Array.from(browserMap.entries()).map(([browser, clicks]) => ({
      browser,
      clicks
    })).sort((a, b) => b.clicks - a.clicks);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
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

  const processedBrowsers = processUserAgents(stats.topUserAgents);

  // Line chart data for clicks per day
  const lineChartData = {
    labels: stats.clicksPerDay.map(item => item.date),
    datasets: [
      {
        label: 'Clicks per Day',
        data: stats.clicksPerDay.map(item => item.clicks),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  // Pie chart data for top referrers
  const pieChartData = {
    labels: stats.topReferrers.map(item => item.referrer || 'Direct'),
    datasets: [
      {
        data: stats.topReferrers.map(item => item.clicks),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
          '#4BC0C0',
          '#FF6384',
        ],
      },
    ],
  };

  // Bar chart data for browsers
  const barChartData = {
    labels: processedBrowsers.map(item => item.browser),
    datasets: [
      {
        label: 'Clicks by Browser',
        data: processedBrowsers.map(item => item.clicks),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="mb-4 text-blue-600 hover:text-blue-800 underline"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics for {slug}
          </h1>
          <p className="text-gray-600 mt-2">
            Total Clicks: <span className="font-semibold">{stats.totalClicks}</span>
          </p>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Line Chart - Clicks per Day */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Clicks Over Time
            </h2>
            {stats.clicksPerDay.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-8">No click data available</p>
            )}
          </div>

          {/* Pie Chart - Top Referrers */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Top Referrers
            </h2>
            {stats.topReferrers.length > 0 ? (
              <Pie data={pieChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-8">No referrer data available</p>
            )}
          </div>

          {/* Bar Chart - Browsers */}
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Browsers & Devices
            </h2>
            {processedBrowsers.length > 0 ? (
              <Bar data={barChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-8">No browser data available</p>
            )}
          </div>
        </div>

        {/* Raw Data Tables */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Referrers Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Referrers
            </h3>
            {stats.topReferrers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Referrer
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.topReferrers.map((referrer, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {referrer.referrer || 'Direct'}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {referrer.clicks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No referrer data</p>
            )}
          </div>

          {/* Top Browsers Table */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Detailed Browsers
            </h3>
            {processedBrowsers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Browser
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Clicks
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {processedBrowsers.map((browser, index) => (
                      <tr key={index}>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {browser.browser}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-900">
                          {browser.clicks}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500">No browser data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}