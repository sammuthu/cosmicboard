#!/bin/bash

echo "🚀 CosmicBoard Services Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "📊 Service Status Check:"
echo "------------------------"

# Check nginx
echo -n "Nginx: "
if brew services list | grep -q "nginx.*started"; then
    echo -e "${GREEN}✓ Running on port 8888${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Run: brew services restart nginx"
fi

# Check dnsmasq
echo -n "DNSMasq: "
if brew services list | grep -q "dnsmasq.*started"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not running${NC}"
    echo "  Run: sudo brew services start dnsmasq"
fi

# Check CosmicBoard app
echo -n "CosmicBoard App: "
if lsof -i :7777 | grep -q LISTEN; then
    echo -e "${GREEN}✓ Running on port 7777${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Run: npm run dev (in cosmicboard directory)"
fi

echo ""
echo "🌐 Port Allocation:"
echo "-------------------"
echo "Port 80:   Python (in use)"
echo "Port 7777: CosmicBoard App"
echo "Port 8080: Docker (in use)"
echo "Port 8888: Nginx (reverse proxy)"
echo ""

echo "📝 DNS Configuration:"
echo "--------------------"
if [ -f /opt/homebrew/etc/dnsmasq.d/cosmic.conf ]; then
    echo -e "${GREEN}✓ cosmic.conf exists${NC}"
    echo "  cosmic.board → 192.168.0.18"
else
    echo -e "${RED}✗ cosmic.conf missing${NC}"
fi

echo ""
echo "🔗 Access URLs:"
echo "---------------"
echo "Direct:  http://192.168.0.18:7777"
echo "Proxied: http://192.168.0.18:8888"
echo "Domain:  http://cosmic.board:8888"
echo ""

echo "⚙️  To start all services:"
echo "-----------------------"
echo "1. Start DNSMasq (if not running):"
echo "   sudo brew services start dnsmasq"
echo ""
echo "2. Configure Mac to use DNSMasq:"
echo "   sudo mkdir -p /etc/resolver"
echo "   echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/board"
echo ""
echo "3. Start CosmicBoard:"
echo "   cd ~/Projects/cosmicboard && npm run dev"
echo ""
echo "4. Access at: http://cosmic.board:8888"
echo ""

# Test resolution
echo "🧪 Testing cosmic.board resolution:"
echo "-----------------------------------"
ping -c 1 cosmic.board > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ cosmic.board resolves correctly${NC}"
else
    echo -e "${YELLOW}⚠ cosmic.board not resolving${NC}"
    echo "  This is expected if DNSMasq is not running or not configured"
fi