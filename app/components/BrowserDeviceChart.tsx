'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

interface BrowserDeviceData {
  browser: string;
  device: string;
  clicks: number;
}

interface BrowserDeviceChartProps {
  data: BrowserDeviceData[];
}

const chartConfig = {
  clicks: {
    label: "Clicks",
    color: "#3b82f6", // blue-500
  },
};

export default function BrowserDeviceChart({ data }: BrowserDeviceChartProps) {
  const [showTable, setShowTable] = useState(false);

  // Group data by browser for the chart
  const browserTotals = data.reduce((acc, item) => {
    acc[item.browser] = (acc[item.browser] || 0) + item.clicks;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(browserTotals).map(([browser, clicks]) => ({
    browser,
    clicks
  }));

  // Device type colors
  const deviceColors: Record<string, string> = {
    Desktop: '#3b82f6', // blue-500
    Mobile: '#10b981', // emerald-500  
    Tablet: '#f59e0b'  // amber-500
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">🌐</span>
            Browser & Device Analytics
          </CardTitle>
          <CardDescription>
            Understand how users access your links
          </CardDescription>
        </div>
        <Button
          onClick={() => setShowTable(!showTable)}
          variant={showTable ? "default" : "outline"}
          className='bg-blue-500 text-white'
          size="sm"
        >
          {showTable ? 'Hide Details' : 'Show Details'}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Browser Bar Chart */}
        <div className="mb-6">
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="browser"
                  className="text-xs fill-muted-foreground"
                />
                <YAxis className="text-xs fill-muted-foreground" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="clicks"
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* Detailed Table */}
        {showTable && (
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <span className="text-xl mr-2">📊</span>
              Detailed Breakdown
            </h4>
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Browser</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Percentage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data
                    .sort((a, b) => b.clicks - a.clicks)
                    .map((item, index) => {
                      const totalClicks = data.reduce((sum, d) => sum + d.clicks, 0);
                      const percentage = ((item.clicks / totalClicks) * 100).toFixed(1);

                      return (
                        <TableRow key={`${item.browser}-${item.device}`}>
                          <TableCell className="font-medium">{item.browser}</TableCell>
                          <TableCell>
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                              style={{ backgroundColor: deviceColors[item.device] || '#6b7280' }}
                            >
                              {item.device}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">{item.clicks}</TableCell>
                          <TableCell className="text-muted-foreground">{percentage}%</TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}