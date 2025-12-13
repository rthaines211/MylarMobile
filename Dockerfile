# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev)
RUN npm ci

# Copy source code
COPY . .

# Build the frontend
RUN npm run build

# Production stage
FROM node:20-alpine

# Install nginx and envsubst (from gettext)
RUN apk add --no-cache nginx gettext

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy backend server
COPY server.js ./

# Copy built frontend to nginx html directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx config template
COPY nginx.conf.template /etc/nginx/conf.d/default.conf.template

# Remove default nginx config
RUN rm -f /etc/nginx/http.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Create nginx pid directory
RUN mkdir -p /run/nginx

# Environment variables
ENV PORT=80
ENV MYLAR_URL=http://localhost:8090

# Expose the configurable port
EXPOSE ${PORT}

ENTRYPOINT ["/entrypoint.sh"]
