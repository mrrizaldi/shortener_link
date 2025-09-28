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

# Copy the standalone output from Next.js build
COPY --from=deps /app/node_modules ./node_modules
COPY build/.next/standalone ./
COPY build/.next/static ./.next/static
COPY build/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Start the application using the standalone server
CMD ["node", "server.js"]
