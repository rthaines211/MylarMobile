#!/bin/sh
set -e

# Defaults
MYLAR_URL=${MYLAR_URL:-http://localhost:8090}
PORT=${PORT:-80}

# Generate nginx config from template
envsubst '${MYLAR_URL} ${PORT}' < /etc/nginx/conf.d/default.conf.template > /etc/nginx/conf.d/default.conf

# Start the backend server in background
BACKEND_PORT=3001 node /app/server.js &

# Start nginx in foreground
nginx -g 'daemon off;'
