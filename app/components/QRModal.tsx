'use client';

import { useState } from 'react';

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  shortUrl: string;
}

export default function QRModal({ isOpen, onClose, slug, shortUrl }: QRModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const qrCodeUrl = `/api/qr/${slug}`;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-${slug}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <span className="text-2xl mr-2">📱</span>
            QR Code
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* QR Code */}
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-xl shadow-md">
            <img
              src={qrCodeUrl}
              alt={`QR Code for ${shortUrl}`}
              className="w-64 h-64 mx-auto"
              onLoad={() => setIsLoading(false)}
              onLoadStart={() => setIsLoading(true)}
            />
            {isLoading && (
              <div className="w-64 h-64 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}
          </div>
        </div>

        {/* URL Display */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Short URL:</p>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <p className="text-blue-600 font-mono text-sm break-all">{shortUrl}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
          >
            <span className="mr-2">📥</span>
            Download QR
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}