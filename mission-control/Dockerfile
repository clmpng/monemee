# =============================================================================
# MISSION CONTROL - Production Dockerfile
# Multi-stage build for optimized image size
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Build Frontend (Vite + TypeScript)
# -----------------------------------------------------------------------------
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ ./

# Build arguments for frontend config
ARG VITE_API_URL=/api
ARG VITE_WS_URL

# Build the Vite app
RUN npm run build

# -----------------------------------------------------------------------------
# Stage 2: Build Backend Dependencies
# -----------------------------------------------------------------------------
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copy package files
COPY backend/package*.json ./

# Install all dependencies
RUN npm ci

# Copy backend source
COPY backend/ ./

# Prune devDependencies for production
RUN npm prune --production

# -----------------------------------------------------------------------------
# Stage 3: Production Image
# -----------------------------------------------------------------------------
FROM node:18-alpine AS production

# Security: Create non-root user
RUN addgroup -g 1001 -S mcadmin && \
    adduser -S mcadmin -u 1001 -G mcadmin

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy built frontend from stage 1
COPY --from=frontend-builder --chown=mcadmin:mcadmin /app/frontend/dist ./frontend/dist

# Copy backend from stage 2
COPY --from=backend-builder --chown=mcadmin:mcadmin /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder --chown=mcadmin:mcadmin /app/backend/src ./backend/src
COPY --from=backend-builder --chown=mcadmin:mcadmin /app/backend/package.json ./backend/package.json

# Set environment
ENV NODE_ENV=production
ENV PORT=5001
ENV WS_PORT=5002

# Switch to non-root user
USER mcadmin

# Expose ports
EXPOSE 5001 5002

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:5001/health || exit 1

# Set working directory to backend
WORKDIR /app/backend

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start the server
CMD ["node", "src/index.js"]
