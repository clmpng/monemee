# =============================================================================
# MONEMEE - Production Dockerfile
# Multi-stage build for optimized image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Frontend
# -----------------------------------------------------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/client

# Copy package files first for better caching
COPY client/package*.json ./

# Install dependencies
RUN npm ci --only=production=false

# Copy source code
COPY client/ ./

# Build arguments for React environment variables (embedded at build time)
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_API_URL=/api/v1

# Build the React app
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Build Backend Dependencies
# -----------------------------------------------------------------------------
FROM node:18-alpine AS backend-builder

WORKDIR /app/server

# Copy package files
COPY server/package*.json ./

# Install all dependencies (including devDependencies for any build steps)
RUN npm ci

# Copy server source
COPY server/ ./

# Prune devDependencies for production
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Production Image
# -----------------------------------------------------------------------------
FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S monemee && \
    adduser -S monemee -u 1001 -G monemee

WORKDIR /app

# Install dumb-init for proper signal handling in containers
RUN apk add --no-cache dumb-init

# Copy built frontend from stage 1
COPY --from=frontend-builder --chown=monemee:monemee /app/client/build ./client/build

# Copy backend from stage 2
COPY --from=backend-builder --chown=monemee:monemee /app/server/node_modules ./server/node_modules
COPY --from=backend-builder --chown=monemee:monemee /app/server/src ./server/src
COPY --from=backend-builder --chown=monemee:monemee /app/server/package.json ./server/package.json

# Copy database migrations for reference
COPY --chown=monemee:monemee database/ ./database/

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

# Switch to non-root user
USER monemee

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5000/health || exit 1

# Set working directory to server
WORKDIR /app/server

# Use dumb-init as entrypoint for proper PID 1 handling
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "src/index.js"]
