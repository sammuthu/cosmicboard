# Nginx Multi-Service Reverse Proxy Setup

## Overview
Nginx is configured as the main reverse proxy on port 80, routing requests to different services based on domain names.

## Service Configuration

### Port Allocations
- **Port 80**: Nginx (main reverse proxy)
- **Port 7777**: CosmicBoard (Next.js app)
- **Port 8088**: Loopify.sam (Python HTTP server)
- **Port 9001**: Loopify backend API

### Domain Routing
| Domain | Service | Backend Port |
|--------|---------|--------------|
| cosmic.board | CosmicBoard | 7777 |
| loopify.sam | Segment Loop Master | 8088 |
| loopify.dev | Segment Loop Master | 8088 |

## Starting Services

### 1. Start CosmicBoard
```bash
cd ~/Projects/cosmicboard
./start.sh
# Runs on port 7777
```

### 2. Start Loopify.sam
```bash
cd ~/Projects/segment-loop-master
./local-start.sh   # For local development
# or
./network-start.sh  # For network access
# Frontend runs on port 8088, backend on 9001
```

### 3. Nginx is auto-started
```bash
# Check status
brew services list | grep nginx

# Restart if needed
brew services restart nginx
```

## Accessing Services

With this setup, you can access services without port numbers:
- http://cosmic.board - CosmicBoard task manager
- http://loopify.sam - Segment Loop Master
- http://loopify.dev - Segment Loop Master (alias)

## Configuration Files

### /etc/hosts
```
192.168.0.18 cosmic.board
192.168.0.18 loopify.sam
192.168.0.18 loopify.dev
```

### Nginx Config
Located at: `/opt/homebrew/etc/nginx/nginx.conf`
- Symlinked to: `/Users/sammuthu/zScripts/bin/reverse-proxy/nginx.conf`

## Troubleshooting

### If a domain doesn't resolve:
1. Check /etc/hosts has the entry
2. Flush DNS cache: `sudo dscacheutil -flushcache`

### If wrong service loads:
1. Check nginx is running: `brew services list | grep nginx`
2. Verify port allocations: `lsof -i :80 -i :7777 -i :8088`
3. Restart nginx: `brew services restart nginx`

### Check service status:
```bash
# What's running on each port
lsof -i :80    # Should be nginx
lsof -i :7777  # Should be node (CosmicBoard)
lsof -i :8088  # Should be python (loopify.sam)
```

## Architecture
```
Browser Request
     ↓
cosmic.board / loopify.sam
     ↓
/etc/hosts (resolves to 192.168.0.18)
     ↓
Nginx on port 80
     ↓
Checks server_name in config
     ↓
Proxies to correct backend port
     ↓
Service responds
```