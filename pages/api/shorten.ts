import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const requestSchema = z.object({
  originalUrl: z.string().url('Invalid URL format'),
  customSlug: z.string()
    .min(3, 'Custom slug must be at least 3 characters')
    .max(30, 'Custom slug must be at most 30 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Custom slug must be alphanumeric')
    .optional()
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Validate request body with Zod
    const validation = requestSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid input' });
    }

    const { originalUrl, customSlug } = validation.data;
    let slug: string;

    if (customSlug) {
      // Check if custom slug already exists
      const existingUrl = await prisma.url.findUnique({
        where: { slug: customSlug }
      });

      if (existingUrl) {
        return res.status(409).json({ error: 'Slug already in use' });
      }

      slug = customSlug;
    } else {
      // Generate unique random slug using nanoid
      let isUnique = false;
      slug = '';

      while (!isUnique) {
        slug = nanoid(6);
        const existingUrl = await prisma.url.findUnique({
          where: { slug }
        });
        isUnique = !existingUrl;
      }
    }

    // Save to database with Prisma
    await prisma.url.create({
      data: {
        originalUrl,
        slug
      }
    });

    // Return response with mrrizaldi.me domain
    const shortUrl = `https://mrrizaldi.me/${slug}`;

    return res.status(201).json({
      shortUrl
    });

  } catch (error) {
    console.error('Error shortening URL:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}