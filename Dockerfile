# Stage 1: Build stage
FROM node:18-alpine AS builder

# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for Prisma)
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Copy application source code
COPY . .

# Stage 2: Production stage
FROM node:18-alpine AS production

# Install OpenSSL and other required libraries for Prisma
RUN apk add --no-cache openssl libc6-compat

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy Prisma schema and generated client from builder
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source code
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 && \
    chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose the application port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/graphql', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD ["node", "server.js"]

