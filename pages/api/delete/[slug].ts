import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    // Check if the URL exists and is not already deleted
    const existingUrl = await prisma.url.findUnique({
      where: { slug },
      select: { id: true, isDeleted: true }
    });

    if (!existingUrl) {
      return res.status(404).json({ error: 'URL not found' });
    }

    if (existingUrl.isDeleted) {
      return res.status(400).json({ error: 'URL is already deleted' });
    }

    // Perform soft delete
    await prisma.url.update({
      where: { slug },
      data: {
        isDeleted: true,
        deletedAt: new Date()
      }
    });

    return res.status(200).json({ message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Error deleting URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}