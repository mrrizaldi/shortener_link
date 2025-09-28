import { redirect, notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function RedirectPage({ params }: PageProps) {
  const { slug } = params;

  try {
    // Query database for the slug
    const urlRecord = await prisma.url.findUnique({
      where: { slug }
    });

    // If not found, return 404
    if (!urlRecord) {
      notFound();
    }

    // Extract request headers
    const headersList = headers();
    const userAgent = (await headersList).get('user-agent') || null;
    const referrer = (await headersList).get('referer') || null;
    const forwarded = (await headersList).get('x-forwarded-for');
    const realIp = (await headersList).get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || null;

    // Use transaction to ensure both operations succeed or fail together
    await prisma.$transaction(async (tx) => {
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
    });

    console.log(`Click tracked for slug "${slug}": ${JSON.stringify({
      userAgent,
      referrer,
      ip,
      timestamp: new Date().toISOString()
    })}`);

    // Redirect to original URL
    redirect(urlRecord.originalUrl);

  } catch (error) {
    console.error('Error processing redirect:', error);
    notFound();
  }
}