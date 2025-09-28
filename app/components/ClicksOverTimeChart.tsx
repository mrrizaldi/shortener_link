'use client';

import React from 'react';

interface ClicksOverTimeData {
  timestamp: string;
  clicks: number;
}

interface ClicksOverTimeChartProps {
  data: ClicksOverTimeData[];
  interval: string;
  onIntervalChange: (interval: string) => void;
}

const INTERVAL_OPTIONS = [
  { value: '15m', label: '15 minutes' },
  { value: '30m', label: '30 minutes' },
  { value: '1h', label: '1 hour' },
  { value: '6h', label: '6 hours' },
  { value: '12h', label: '12 hours' },
  { value: '1d', label: '1 day' },
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' }
];

const ClicksOverTimeChart = React.memo(function ClicksOverTimeChart({ data, interval, onIntervalChange }: ClicksOverTimeChartProps) {
  const maxClicks = React.useMemo(() => Math.max(...data.map(d => d.clicks), 1), [data]);

  const formatTimestamp = React.useCallback((timestamp: string, interval: string) => {
    const date = new Date(timestamp);

    if (['15m', '30m', '1h'].includes(interval)) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } else if (['6h', '12h'].includes(interval)) {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit'
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  }, []);

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center">
          <span className="text-2xl mr-2">📈</span>
          Clicks Over Time
        </h3>
        <select
          value={interval}
          onChange={(e) => onIntervalChange(e.target.value)}
          className="border-2 border-gray-300 rounded-md px-3 py-1 text-sm font-medium text-gray-800 focus:border-blue-500 focus:outline-none transition-colors bg-white"
        >
          {INTERVAL_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {data.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-gray-500">No click data available for this interval</p>
        </div>
      ) : (
        <div className="h-64 flex items-end space-x-1 overflow-x-auto">
          {data.map((item, index) => (
            <div key={index} className="flex flex-col items-center flex-shrink-0 min-w-[40px]">
              <div className="mb-2 text-xs font-semibold text-blue-600">
                {item.clicks}
              </div>
              <div
                className="w-8 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md min-h-[4px] flex items-end justify-center relative group cursor-pointer"
                style={{ height: `${(item.clicks / maxClicks) * 200}px` }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
                  {formatTimestamp(item.timestamp, interval)}: {item.clicks} clicks
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-500 transform -rotate-45 origin-top-left w-20 text-center">
                {formatTimestamp(item.timestamp, interval)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default ClicksOverTimeChart;