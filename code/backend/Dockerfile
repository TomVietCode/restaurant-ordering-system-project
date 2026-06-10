FROM node:20-alpine as builder
WORKDIR /app

# copy dependencies first for caching
COPY package*.json ./
RUN npm ci

# copy source and build
COPY . .
RUN npm run build --if-present

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production

# install production deps
COPY package*.json ./
RUN npm ci --production

# copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/main.js"]
