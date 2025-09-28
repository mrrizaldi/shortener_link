'use client';

import { useState } from 'react';

interface BrowserDeviceData {
  browser: string;
  device: string;
  clicks: number;
}

interface BrowserDeviceChartProps {
  data: BrowserDeviceData[];
}

export default function BrowserDeviceChart({ data }: BrowserDeviceChartProps) {
  const [showTable, setShowTable] = useState(false);

  // Group data by browser for the chart
  const browserTotals = data.reduce((acc, item) => {
    acc[item.browser] = (acc[item.browser] || 0) + item.clicks;
    return acc;
  }, {} as Record<string, number>);

  const browserData = Object.entries(browserTotals).map(([browser, clicks]) => ({
    browser,
    clicks
  }));

  // Device type colors
  const deviceColors: Record<string, string> = {
    Desktop: '#3b82f6', // blue
    Mobile: '#10b981',  // green
    Tablet: '#f59e0b'   // orange
  };

  const maxClicks = Math.max(...browserData.map(d => d.clicks));

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">🌐</span>
          Browser & Device Analytics
        </h3>
        <button
          onClick={() => setShowTable(!showTable)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          {showTable ? 'Hide Details' : 'Show Details'}
        </button>
      </div>

      {/* Browser Bar Chart */}
      <div className="mb-6">
        <div className="space-y-3">
          {browserData.map(({ browser, clicks }) => (
            <div key={browser} className="flex items-center">
              <div className="w-20 text-sm font-medium text-gray-700 text-right mr-3">
                {browser}
              </div>
              <div className="flex-1 relative">
                <div
                  className="h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-end pr-3 text-white text-sm font-semibold"
                  style={{ width: `${(clicks / maxClicks) * 100}%`, minWidth: '40px' }}
                >
                  {clicks}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Table */}
      {showTable && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <span className="text-xl mr-2">📊</span>
            Detailed Breakdown
          </h4>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Browser
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Device
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
                {data
                  .sort((a, b) => b.clicks - a.clicks)
                  .map((item, index) => {
                    const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
                    const percentage = ((item.clicks / totalClicks) * 100).toFixed(1);

                    return (
                      <tr key={`${item.browser}-${item.device}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.browser}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: deviceColors[item.device] || '#6b7280' }}
                          >
                            {item.device}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                          {item.clicks}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
  );
}