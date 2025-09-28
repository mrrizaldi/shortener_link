'use client';

import { useState } from 'react';
import Link from 'next/link';
import QRModal from '../components/QRModal';
import { formatDistanceToNow } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useUrls, useDeleteUrl } from '@/lib/hooks';

interface UrlRecord {
  slug: string;
  originalUrl: string;
  hitCount: number;
  createdAt: string;
}

export default function Dashboard() {
  const { data: urls = [], isLoading: isLoadingUrls } = useUrls();
  const deleteUrl = useDeleteUrl();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [qrModal, setQrModal] = useState<{ isOpen: boolean; slug: string; shortUrl: string }>({
    isOpen: false,
    slug: '',
    shortUrl: ''
  });

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

  const handleDelete = async (slug: string) => {
    if (window.confirm('Are you sure you want to delete this URL? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        await deleteUrl.mutateAsync(slug);
        // Cache will be invalidated automatically by the mutation
      } catch (error) {
        alert('Failed to delete URL: ' + (error instanceof Error ? error.message : 'Unknown error'));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-25 to-white relative overflow-hidden pt-16">
      {/* Loading Overlay */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <p className="text-lg font-medium text-gray-700">Deleting URL...</p>
            <p className="text-sm text-gray-500">Please wait while we remove the link</p>
          </div>
        </div>
      )}

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
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Links</p>
                  <p className="text-3xl font-bold text-blue-600">{urls.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Clicks</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {urls.reduce((sum, url) => sum + url.hitCount, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">👆</span>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Average Clicks</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {urls.length > 0 ? Math.round(urls.reduce((sum, url) => sum + url.hitCount, 0) / urls.length) : 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Your Links Section */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center">
                  <span className="text-2xl mr-3">📋</span>
                  Your Links
                </CardTitle>
                <CardDescription>
                  Manage and track your shortened URLs
                </CardDescription>
              </div>
            </div>

            {/* Search Bar */}
            <div className="mt-4">
              <Input
                type="text"
                placeholder="🔍 Search by slug or original URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
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
                  <Button asChild>
                    <Link href="/">
                      🚀 Create First Link
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Short URL</TableHead>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>QR Code</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUrls.map((url) => (
                      <TableRow key={url.slug} className="hover:bg-muted/50">
                        <TableCell>
                          <a
                            href={formatShortUrl(url.slug)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold text-sm flex items-center"
                          >
                            🔗 {formatShortUrl(url.slug)}
                          </a>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-gray-700 max-w-xs truncate font-medium" title={url.originalUrl}>
                            {url.originalUrl}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 font-medium">
                          {formatDate(url.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => openQRModal(url.slug)}
                            size="sm"
                            variant="outline"
                            className="h-10 w-10 p-0"
                            title="View QR Code"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button asChild size="sm" className='bg-blue-500 text-white'>
                            <Link href={`/dashboard/${url.slug}`}>
                              📊 Details
                            </Link>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => handleDelete(url.slug)}
                            size="sm"
                            variant="destructive"
                            disabled={deleteUrl.isPending || isDeleting}
                            className="h-8 w-8 p-0"
                            title="Delete URL"
                          >
                            {deleteUrl.isPending || isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
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