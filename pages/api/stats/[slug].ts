import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    // First, find the URL record to get the ID
    const urlRecord = await prisma.url.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!urlRecord) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const urlId = urlRecord.id;

    // Get total clicks count
    const totalClicks = await prisma.click.count({
      where: { urlId }
    });

    // Get clicks per day (grouped by date)
    const clicksPerDayRaw = await prisma.click.groupBy({
      by: ['timestamp'],
      where: { urlId },
      _count: {
        id: true
      }
    });

    // Process clicks per day to group by date only (not time)
    const clicksPerDayMap = new Map<string, number>();
    clicksPerDayRaw.forEach(click => {
      const date = click.timestamp.toISOString().split('T')[0]; // Get YYYY-MM-DD
      const currentCount = clicksPerDayMap.get(date) || 0;
      clicksPerDayMap.set(date, currentCount + click._count.id);
    });

    const clicksPerDay = Array.from(clicksPerDayMap.entries()).map(([date, count]) => ({
      date,
      clicks: count
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Get top referrers (grouped by referrer)
    const topReferrersRaw = await prisma.click.groupBy({
      by: ['referrer'],
      where: {
        urlId,
        referrer: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const topReferrers = topReferrersRaw.map(item => ({
      referrer: item.referrer,
      clicks: item._count.id
    }));

    // Get top user agents (grouped by userAgent)
    const topUserAgentsRaw = await prisma.click.groupBy({
      by: ['userAgent'],
      where: {
        urlId,
        userAgent: {
          not: null
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 10
    });

    const topUserAgents = topUserAgentsRaw.map(item => ({
      userAgent: item.userAgent,
      clicks: item._count.id
    }));

    // Return comprehensive stats
    return res.status(200).json({
      slug,
      totalClicks,
      clicksPerDay,
      topReferrers,
      topUserAgents
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}