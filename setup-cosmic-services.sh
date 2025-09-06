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

# Check CosmicBoard Frontend
echo -n "CosmicBoard Frontend: "
if lsof -i :7777 | grep -q LISTEN; then
    echo -e "${GREEN}✓ Running on port 7777${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Run: npm run dev (in cosmicboard directory)"
fi

# Check CosmicBoard Backend
echo -n "CosmicBoard Backend: "
if lsof -i :7778 | grep -q LISTEN; then
    echo -e "${GREEN}✓ Running on port 7778${NC}"
    # Check for media endpoints
    if curl -s http://localhost:7778/api/media > /dev/null 2>&1; then
        echo -e "  ${GREEN}✓ Media endpoints available${NC}"
    else
        echo -e "  ${YELLOW}⚠ Media endpoints not available - restart may be needed${NC}"
        echo "  Run: ./start.sh --restart-backend"
    fi
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Run: cd ../cosmicboard-backend && npm run dev"
fi

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker ps | grep -q "cosmicboard_postgres"; then
    echo -e "${GREEN}✓ Running in Docker${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
    echo "  Run: cd ../cosmicboard-backend && docker compose up -d"
fi

echo ""
echo "🌐 Port Allocation:"
echo "-------------------"
echo "Port 80:   Python (in use)"
echo "Port 5432: PostgreSQL (Docker)"
echo "Port 7777: CosmicBoard Frontend"
echo "Port 7778: CosmicBoard Backend API"
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
echo "Frontend Direct:  http://192.168.0.18:7777"
echo "Backend API:      http://192.168.0.18:7778/api"
echo "Via Nginx:        http://192.168.0.18:8888"
echo "Domain:           http://cosmic.board:8888"
echo ""
echo "📸 Media Features:"
echo "-----------------"
echo "• Photos:      Upload, view in lightbox, rename, delete"
echo "• Screenshots: Paste with Cmd/Ctrl+V, timeline view"
echo "• PDFs:        Upload, in-app viewer with zoom"
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
echo "3. Start CosmicBoard with all services:"
echo "   cd ~/Projects/cosmicboard && ./start.sh"
echo ""
echo "   To force backend restart (for new endpoints):"
echo "   ./start.sh --restart-backend"
echo ""
echo "4. Access at: http://cosmic.board:8888"
echo ""
echo "📝 Note: The start.sh script will:"
echo "   • Run this setup check automatically"
echo "   • Start/restart backend if needed"
echo "   • Ensure PostgreSQL is running"
echo "   • Start the frontend development server"
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