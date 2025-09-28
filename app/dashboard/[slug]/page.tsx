'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ClicksOverTimeChart from '../../components/ClicksOverTimeChart';
import BrowserDeviceChart from '../../components/BrowserDeviceChart';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStats } from '@/lib/hooks';

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
  const [currentInterval, setCurrentInterval] = useState('1d');

  const { data: stats, isLoading, error } = useStats(slug, currentInterval);

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
            <p className="text-red-600 text-lg mb-4">{error.message || 'An error occurred'}</p>
            <Button onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
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
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent mb-4">
            Link Details
          </h1>
        </div>

        {/* Short Link & QR Code Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🔗</span>
              Short Link Information
            </CardTitle>
            <CardDescription>
              Detailed information about your shortened link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
              <div className="lg:col-span-2 space-y-4">
                <div>
                  <Label htmlFor="shortUrl" className="text-sm font-medium text-gray-600">Short URL</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="shortUrl"
                      type="text"
                      value={formatShortUrl(stats.slug)}
                      readOnly
                      className="flex-1 text-blue-600 font-mono text-sm"
                    />
                    <Button onClick={copyToClipboard} size="sm" className='bg-blue-500 text-white'>
                      Copy
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="originalUrl" className="text-sm font-medium text-gray-600">Original URL</Label>
                  <div className="mt-1">
                    <Input
                      id="originalUrl"
                      type="text"
                      value={stats.url}
                      readOnly
                      className="text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Created</Label>
                    <div className="mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 font-medium">
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
                    <Label className="text-sm font-medium text-gray-600">Total Clicks</Label>
                    <div className="mt-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded-lg text-sm font-bold text-blue-700">
                      {stats.totalClicks}
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="flex flex-col items-center space-y-4">
                  <Label className="text-lg font-semibold text-gray-800">QR Code</Label>
                  <div className="p-4 bg-white border-2 border-gray-200 rounded-xl shadow-md">
                    <img
                      src={`/api/qr/${stats.slug}`}
                      alt={`QR Code for ${formatShortUrl(stats.slug)}`}
                      className="w-32 h-32"
                    />
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={`/api/qr/${stats.slug}`}
                      download={`qr-${stats.slug}.png`}
                    >
                      Download QR
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                Top Referrers
              </CardTitle>
              <CardDescription>
                Sources of traffic to your link
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Referrer</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Percentage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.topReferrers.map((referrer, index) => {
                      const percentage = ((referrer.clicks / stats.totalClicks) * 100).toFixed(1);
                      return (
                        <TableRow key={index}>
                          <TableCell className="max-w-xs truncate">
                            {referrer.referrer || 'Direct'}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {referrer.clicks}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {percentage}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}