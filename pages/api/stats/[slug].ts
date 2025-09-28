import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface IntervalConfig {
  sqlExpression: string;
  intervalMinutes: number;
}

const INTERVAL_CONFIGS: Record<string, IntervalConfig> = {
  '15m': { sqlExpression: "DATE_TRUNC('hour', timestamp) + INTERVAL '15 minute' * FLOOR(EXTRACT(minute FROM timestamp) / 15)", intervalMinutes: 15 },
  '30m': { sqlExpression: "DATE_TRUNC('hour', timestamp) + INTERVAL '30 minute' * FLOOR(EXTRACT(minute FROM timestamp) / 30)", intervalMinutes: 30 },
  '1h': { sqlExpression: "DATE_TRUNC('hour', timestamp)", intervalMinutes: 60 },
  '6h': { sqlExpression: "DATE_TRUNC('day', timestamp) + INTERVAL '6 hour' * FLOOR(EXTRACT(hour FROM timestamp) / 6)", intervalMinutes: 360 },
  '12h': { sqlExpression: "DATE_TRUNC('day', timestamp) + INTERVAL '12 hour' * FLOOR(EXTRACT(hour FROM timestamp) / 12)", intervalMinutes: 720 },
  '1d': { sqlExpression: "DATE_TRUNC('day', timestamp)", intervalMinutes: 1440 },
  '7d': { sqlExpression: "DATE_TRUNC('week', timestamp)", intervalMinutes: 10080 },
  '30d': { sqlExpression: "DATE_TRUNC('month', timestamp)", intervalMinutes: 43200 }
};

function parseUserAgent(userAgent: string | null) {
  if (!userAgent) return { browser: 'Unknown', device: 'Unknown' };

  const ua = userAgent.toLowerCase();

  // Browser detection
  let browser = 'Unknown';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('opera')) browser = 'Opera';

  // Device detection
  let device = 'Desktop';
  if (ua.includes('mobile')) device = 'Mobile';
  else if (ua.includes('tablet') || ua.includes('ipad')) device = 'Tablet';

  return { browser, device };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, interval = '1d' } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  if (typeof interval !== 'string' || !INTERVAL_CONFIGS[interval]) {
    return res.status(400).json({ error: 'Invalid interval' });
  }

  try {
    // First, find the URL record
    const urlRecord = await prisma.url.findUnique({
      where: { slug },
      select: { id: true, originalUrl: true, createdAt: true, hitCount: true }
    });

    if (!urlRecord) {
      return res.status(404).json({ error: 'URL not found' });
    }

    const urlId = urlRecord.id;

    // Get total clicks count
    const totalClicks = await prisma.click.count({
      where: { urlId }
    });

    // Get clicks over time with dynamic intervals using string interpolation for SQL expression
    const intervalConfig = INTERVAL_CONFIGS[interval];
    const sqlQuery = `
      SELECT
        ${intervalConfig.sqlExpression} as interval_start,
        COUNT(*)::int as clicks
      FROM "clicks"
      WHERE "urlId" = $1
      GROUP BY interval_start
      ORDER BY interval_start ASC
    `;

    console.log('SQL Query:', sqlQuery);
    const clicksOverTimeRaw = await prisma.$queryRawUnsafe(
      sqlQuery,
      urlId
    ) as Array<{ interval_start: any; clicks: number }>;

    const clicksOverTime = clicksOverTimeRaw.map(item => {
      console.log('Raw interval_start:', item.interval_start, typeof item.interval_start);
      try {
        const date = new Date(item.interval_start);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid date');
        }
        return {
          timestamp: date.toISOString(),
          clicks: item.clicks
        };
      } catch (error) {
        console.error('Date conversion error:', error, 'for value:', item.interval_start);
        // Fallback to current time if date is invalid
        return {
          timestamp: new Date().toISOString(),
          clicks: item.clicks
        };
      }
    });

    // Get all clicks for browser/device analysis
    const allClicks = await prisma.click.findMany({
      where: { urlId },
      select: { userAgent: true }
    });

    // Process browser and device data
    const browserDeviceMap = new Map<string, Map<string, number>>();

    allClicks.forEach(click => {
      const { browser, device } = parseUserAgent(click.userAgent);

      if (!browserDeviceMap.has(browser)) {
        browserDeviceMap.set(browser, new Map());
      }

      const deviceMap = browserDeviceMap.get(browser)!;
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    // Convert to array format for charts
    const browserDeviceStats: Array<{ browser: string; device: string; clicks: number }> = [];
    browserDeviceMap.forEach((deviceMap, browser) => {
      deviceMap.forEach((clicks, device) => {
        browserDeviceStats.push({ browser, device, clicks });
      });
    });

    // Get top referrers
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

    // Add caching headers - shorter cache for stats as they update more frequently
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=300');

    // Return comprehensive stats
    return res.status(200).json({
      slug,
      url: urlRecord.originalUrl,
      createdAt: urlRecord.createdAt.toISOString(),
      totalClicks,
      clicksOverTime,
      browserDeviceStats,
      topReferrers,
      interval
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}