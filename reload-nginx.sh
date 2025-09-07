#!/bin/bash

echo "Reloading nginx with cosmicspace.app configuration..."

# Kill existing nginx
sudo pkill -9 nginx 2>/dev/null
sleep 2

# Start nginx
sudo nginx -c /opt/homebrew/etc/nginx/nginx.conf

echo "✅ Nginx reloaded successfully!"
echo ""
echo "Test URLs:"
echo "  https://cosmicspace.app"
echo "  https://www.cosmicspace.app"