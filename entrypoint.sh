#!/bin/sh
set -e

# Defaults
MYLAR_URL=${MYLAR_URL:-http://localhost:8090}
PORT=${PORT:-80}

# Generate nginx config from template
envsubst '${MYLAR_URL} ${PORT}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# Start the backend server in background (override PORT for node process)
PORT=3001 node /app/server.js &

# Start nginx in foreground
nginx -g 'daemon off;'
