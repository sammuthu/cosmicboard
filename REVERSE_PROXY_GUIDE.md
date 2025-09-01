# Reverse Proxy Setup Guide
## How to Map a New Service with Nginx

This guide shows you how to map any service running on localhost to a custom domain using nginx reverse proxy.

## Quick Setup Steps

### Step 1: Choose Your Domain and Port
Decide on:
- **Domain name**: e.g., `myapp.local`, `prism.ai`, `dashboard.dev`
- **Port number**: Where your service runs (e.g., 3000, 8080, 9393)

### Step 2: Add Domain to /etc/hosts
Add your domain to map to your local IP:

```bash
# For local-only access (127.0.0.1)
echo "127.0.0.1 yourdomain.local" | sudo tee -a /etc/hosts

# For network access (192.168.0.18 or your IP)
echo "192.168.0.18 yourdomain.local" | sudo tee -a /etc/hosts
```

### Step 3: Configure Nginx
Edit `/opt/homebrew/etc/nginx/nginx.conf` and add your server block:

```nginx
# Your Service Name
server {
    listen 80;
    server_name yourdomain.local;

    location / {
        proxy_pass http://127.0.0.1:YOUR_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: Reload Nginx
```bash
# Test configuration
nginx -t

# Reload nginx
brew services reload nginx
```

### Step 5: Test Your Domain
```bash
# Test domain resolution
ping yourdomain.local

# Test HTTP access
curl http://yourdomain.local
```

## Real Example: prism.ai Setup

Here's exactly how prism.ai was successfully configured:

### 1. Service Details
- **Service**: RichPrism AI (Next.js app)
- **Port**: 9393
- **Domain**: prism.ai

### 2. Added to /etc/hosts
```bash
# Added this line to /etc/hosts
127.0.0.1 prism.ai www.prism.ai
```

### 3. Nginx Configuration
Added this to `/opt/homebrew/etc/nginx/nginx.conf`:

```nginx
# Prism.ai service
server {
    listen 80;
    server_name prism.ai;

    location / {
        proxy_pass http://127.0.0.1:9393;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. Result
- **Before**: http://localhost:9393
- **After**: http://prism.ai

## Automated Setup Script

Save this as `add-service-proxy.sh`:

```bash
#!/bin/bash

# Get service details
read -p "Enter domain name (e.g., myapp.local): " DOMAIN
read -p "Enter port number: " PORT
read -p "Enter service name: " SERVICE_NAME

# Add to hosts file
echo "Adding $DOMAIN to /etc/hosts..."
echo "127.0.0.1 $DOMAIN" | sudo tee -a /etc/hosts

# Create nginx config snippet
cat << EOF > /tmp/nginx-service.conf

# $SERVICE_NAME
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo ""
echo "Nginx configuration saved to /tmp/nginx-service.conf"
echo "Add this to /opt/homebrew/etc/nginx/nginx.conf"
echo ""
echo "Then run:"
echo "  nginx -t"
echo "  brew services reload nginx"
echo ""
echo "Access your service at: http://$DOMAIN"
```

## Currently Configured Services

| Domain | Service | Port | Status |
|--------|---------|------|--------|
| cosmic.board | CosmicBoard | 7777 | ✅ Active |
| loopify.sam | Segment Loop Master | 8088 | ✅ Active |
| loopify.dev | Segment Loop Master | 8088 | ✅ Active |
| prism.ai | RichPrism AI | 9393 | ✅ Active |

## Common Issues & Solutions

### Domain Not Resolving
```bash
# Check hosts file
cat /etc/hosts | grep yourdomain

# Flush DNS cache
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder
```

### Wrong Service Loading
```bash
# Check nginx config
nginx -t

# Restart nginx completely
brew services stop nginx
brew services start nginx
```

### Port Already in Use
```bash
# Find what's using the port
lsof -i :PORT_NUMBER

# Kill if needed
lsof -ti:PORT_NUMBER | xargs kill -9
```

## Testing Your Setup

### Quick Test Commands
```bash
# Test all at once
DOMAIN="yourdomain.local"
echo "1. Ping test:" && ping -c 1 $DOMAIN
echo "2. HTTP test:" && curl -I http://$DOMAIN
echo "3. Port check:" && lsof -i :YOUR_PORT
```

### Verify Nginx Routing
```bash
# Test with Host header (before adding to /etc/hosts)
curl -H "Host: yourdomain.local" http://127.0.0.1
```

## Tips & Best Practices

1. **Use .local or .dev for local domains** - Avoid real TLDs
2. **Document your port usage** - Keep track in this file
3. **Test before committing** - Use curl with Host header first
4. **Keep nginx config organized** - Add comments for each service
5. **Use consistent formatting** - Copy existing server blocks

## Port Registry

Keep track of used ports to avoid conflicts:

| Port Range | Purpose | Examples |
|------------|---------|----------|
| 3000-3999 | Node.js apps | 3000: React, 3333: Custom API |
| 4000-4999 | Dev servers | 4200: Angular, 4000: Phoenix |
| 5000-5999 | Python apps | 5000: Flask, 5432: PostgreSQL |
| 7000-7999 | Custom services | 7777: CosmicBoard |
| 8000-8999 | Alternative HTTP | 8088: Loopify, 8080: Common default |
| 9000-9999 | API services | 9393: Prism AI, 9001: Backend APIs |

## Full Example: Adding a New React App

Let's say you have a React app on port 3000 and want it at `myreact.local`:

```bash
# 1. Add to hosts
echo "127.0.0.1 myreact.local" | sudo tee -a /etc/hosts

# 2. Add nginx config (edit /opt/homebrew/etc/nginx/nginx.conf)
# Add this server block:
#
# server {
#     listen 80;
#     server_name myreact.local;
#     
#     location / {
#         proxy_pass http://127.0.0.1:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

# 3. Reload nginx
nginx -t && brew services reload nginx

# 4. Start your React app
npm start  # or yarn start

# 5. Access at http://myreact.local
```

## Network Access Setup

To access from other devices on your network:

1. Use your machine's IP (e.g., 192.168.0.18) in hosts file
2. Configure other devices' hosts files to point domain to your IP
3. Or use the IP directly: http://192.168.0.18 (nginx will route based on Host header)

---

Last Updated: September 2025
Successfully Configured Example: prism.ai → localhost:9393