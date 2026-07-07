# Stage 1: Install all dependencies (including development dependencies)
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy dependency definition files to cache the installation layer
COPY package.json package-lock.json ./
RUN npm ci

# Stage 2: Build the NestJS application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Compile TS code to JS (generates the /dist folder)
RUN npm run build

# Stage 3: Install production-only dependencies
FROM node:20-alpine AS prod-deps
WORKDIR /app
COPY package.json package-lock.json ./
# --omit=dev ensures devDependencies are skipped, reducing image size
RUN npm ci --omit=dev

# Stage 4: Production runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Use the pre-existing non-root 'node' user provided by node-alpine for security
USER node

# Copy only production dependencies and compiled files
COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/package.json ./package.json

EXPOSE 3000

ENV PORT=3000

# Bootstrap NestJS from the compiled JavaScript main file
CMD ["node", "dist/main.js"]
