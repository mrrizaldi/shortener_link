'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
  shortUrl: string;
}

export default function QRModal({ isOpen, onClose, slug, shortUrl }: QRModalProps) {
  const [isLoading, setIsLoading] = useState(false);

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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <span className="text-2xl mr-2">📱</span>
            QR Code
          </DialogTitle>
          <DialogDescription>
            Scan this QR code to access your short link
          </DialogDescription>
        </DialogHeader>

        {/* QR Code */}
        <div className="text-center my-6">
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
        <div className="space-y-2">
          <p className="text-sm text-gray-600">Short URL:</p>
          <Input
            value={shortUrl}
            readOnly
            className="text-blue-600 font-mono text-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleDownload}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600"
          >
            <span className="mr-2">📥</span>
            Download QR
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}