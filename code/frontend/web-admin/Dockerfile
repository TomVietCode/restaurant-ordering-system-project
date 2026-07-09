# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files to install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Disable Next.js telemetry collection during build
ENV NEXT_TELEMETRY_DISABLED=1

# Expose build-time arguments (Next.js bakes NEXT_PUBLIC_ variables into the JS bundle during build)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# Stage 3: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Disable Next.js telemetry collection during runtime
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root system user and group for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static public assets
COPY --from=builder /app/public ./public

# Set up directory for Next.js cache and ensure correct permissions
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy the standalone production build files and static assets
# Standalone mode copies only the necessary files for the Node server to run
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to the non-root user
USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# server.js is created automatically by Next.js in standalone mode
CMD ["node", "server.js"]
