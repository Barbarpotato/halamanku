# Use the official Node.js 20 image for builds
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build app for production
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app

# Next can use environment variable for NODE_ENV
ENV NODE_ENV=production

# Install only production dependencies
COPY package*.json ./
RUN npm ci --production

# Copy built app and static assets
COPY --from=builder /app/.next .next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "start"]
