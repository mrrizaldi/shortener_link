# Use the official Node.js 20 Alpine image
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY build/package*.json ./
COPY build/pnpm-lock.yaml* ./

# Install dependencies using pnpm
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=deps /app/node_modules ./node_modules
COPY build/.next ./.next
COPY build/public ./public
COPY build/package*.json ./
COPY build/app ./app
COPY build/pages ./pages
COPY build/next.config.ts ./
COPY build/prisma ./prisma

RUN corepack enable pnpm && pnpm add prisma --save-dev
RUN corepack enable pnpm && pnpm exec prisma generate

# Change ownership of the app directory to nextjs user
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using Next.js start command
CMD ["npm", "start"]
