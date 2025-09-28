import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  try {
    // Query database for the slug
    const urlRecord = await prisma.url.findUnique({
      where: { slug }
    });

    // If not found, return 404
    if (!urlRecord) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    // Extract request headers for tracking
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || null;

    // Track click asynchronously (don't await to avoid blocking redirect)
    prisma.$transaction(async (tx) => {
      // Insert Click record with tracking data
      await tx.click.create({
        data: {
          urlId: urlRecord.id,
          userAgent,
          referrer,
          ip
        }
      });

      // Increment hit count
      await tx.url.update({
        where: { id: urlRecord.id },
        data: {
          hitCount: {
            increment: 1
          }
        }
      });
    }).then(() => {
      console.log(`Click tracked for slug "${slug}": ${JSON.stringify({
        userAgent,
        referrer,
        ip,
        timestamp: new Date().toISOString()
      })}`);
    }).catch((error) => {
      console.error('Error tracking click:', error);
    });

    // Immediate redirect without waiting for tracking
    return NextResponse.redirect(urlRecord.originalUrl, { status: 307 });

  } catch (error) {
    console.error('Error processing redirect:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}