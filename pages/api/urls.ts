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

  try {
    const urls = await prisma.url.findMany({
      select: {
        slug: true,
        originalUrl: true,
        hitCount: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return res.status(200).json(urls);
  } catch (error) {
    console.error('Error fetching URLs:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}