'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "#3b82f6", // blue-500
  },
};

const ClicksOverTimeChart = React.memo(function ClicksOverTimeChart({ data, interval, onIntervalChange }: ClicksOverTimeChartProps) {
  const [showTable, setShowTable] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 10;

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

  const formatDetailedTimestamp = React.useCallback((timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }, []);

  const chartData = React.useMemo(() => {
    return data.map(item => ({
      ...item,
      formattedTime: formatTimestamp(item.timestamp, interval)
    }));
  }, [data, interval, formatTimestamp]);

  // Prepare filtered and paginated data for table
  const filteredData = React.useMemo(() => {
    return data
      .filter(item => item.clicks > 0)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [data]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  // Reset to page 1 when data or interval changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [data, interval]);

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const goToPrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">📈</span>
            Clicks Over Time
          </CardTitle>
          <CardDescription>
            Track your link performance over different time periods
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowTable(!showTable)}
            variant={showTable ? "default" : "outline"}
            className='bg-blue-500 text-white'
            size="sm"
          >
            {showTable ? 'Hide Details' : 'Show Details'}
          </Button>
          <Select value={interval} onValueChange={onIntervalChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              {INTERVAL_OPTIONS.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📊</div>
            <p className="text-gray-500">No click data available for this interval</p>
          </div>
        ) : (
          <>
            <ChartContainer config={chartConfig} className="h-[400px] mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="formattedTime"
                    className="text-xs fill-muted-foreground"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis className="text-xs fill-muted-foreground" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>

            {/* Detailed Table */}
            {showTable && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                    <span className="text-xl mr-2">🕒</span>
                    Detailed Click Timeline
                  </h4>
                  {filteredData.length > 0 && (
                    <div className="text-sm text-gray-500">
                      Showing {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredData.length)}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} of {filteredData.length} entries
                    </div>
                  )}
                </div>
                
                {filteredData.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-500">No clicks recorded in this time period</p>
                  </div>
                ) : (
                  <>
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date & Time</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead>Clicks</TableHead>
                            <TableHead>Percentage of Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {paginatedData.map((item, index) => {
                            const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
                            const percentage = totalClicks > 0 ? ((item.clicks / totalClicks) * 100).toFixed(1) : '0.0';
                            
                            return (
                              <TableRow key={`${item.timestamp}-${index}`}>
                                <TableCell className="font-medium">
                                  {formatDetailedTimestamp(item.timestamp)}
                                </TableCell>
                                <TableCell>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {formatTimestamp(item.timestamp, interval)}
                                  </span>
                                </TableCell>
                                <TableCell className="font-semibold text-blue-600">
                                  {item.clicks} {item.clicks === 1 ? 'click' : 'clicks'}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{percentage}%</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4">
                        <div className="text-sm text-gray-500">
                          Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={goToPrevPage}
                            disabled={currentPage === 1}
                            size="sm"
                            variant="outline"
                            className="px-3"
                          >
                            Previous
                          </Button>
                          
                          {/* Page Numbers */}
                          <div className="flex items-center space-x-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              let pageNumber;
                              if (totalPages <= 5) {
                                pageNumber = i + 1;
                              } else if (currentPage <= 3) {
                                pageNumber = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNumber = totalPages - 4 + i;
                              } else {
                                pageNumber = currentPage - 2 + i;
                              }
                              
                              return (
                                <Button
                                  key={pageNumber}
                                  onClick={() => goToPage(pageNumber)}
                                  size="sm"
                                  variant={currentPage === pageNumber ? "default" : "outline"}
                                  className={`w-8 h-8 p-0 ${currentPage === pageNumber ? 'bg-blue-500 text-white' : ''}`}
                                >
                                  {pageNumber}
                                </Button>
                              );
                            })}
                          </div>

                          <Button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            size="sm"
                            variant="outline"
                            className="px-3"
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
});

export default ClicksOverTimeChart;