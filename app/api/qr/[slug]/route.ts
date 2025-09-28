import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check if the slug exists in the database
    const urlRecord = await prisma.url.findUnique({
      where: { slug }
    });

    if (!urlRecord) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    // Generate the full short URL
    const shortUrl = `https://mrrizaldi.me/${slug}`;

    // Generate QR code as PNG buffer
    const qrCodeBuffer = await QRCode.toBuffer(shortUrl, {
      type: 'png',
      width: 256,
      margin: 2,
      color: {
        dark: '#1e40af', // Blue color to match theme
        light: '#ffffff'
      }
    });

    // Return the QR code as an image response
    return new NextResponse(qrCodeBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Disposition': `inline; filename="qr-${slug}.png"`
      }
    });

  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR code' }, { status: 500 });
  }
}