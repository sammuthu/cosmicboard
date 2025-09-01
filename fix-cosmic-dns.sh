#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}🌌 CosmicBoard DNS Resolution Fix${NC}"
echo "====================================="
echo ""

# Check current resolution
echo -e "${BLUE}📊 Current DNS Status:${NC}"
echo "----------------------"

# Test loopify.sam (working reference)
echo -n "loopify.sam: "
if ping -c 1 -W 1 loopify.sam > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Resolving${NC}"
else
    echo -e "${RED}✗ Not resolving${NC}"
fi

# Test cosmic.board
echo -n "cosmic.board: "
if ping -c 1 -W 1 cosmic.board > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Resolving${NC}"
else
    echo -e "${RED}✗ Not resolving${NC}"
fi

echo ""
echo -e "${BLUE}🔍 Checking /etc/hosts:${NC}"
echo "-----------------------"

if grep -q "cosmic.board" /etc/hosts; then
    echo -e "${GREEN}✓ cosmic.board entry exists in /etc/hosts${NC}"
    grep cosmic.board /etc/hosts
else
    echo -e "${RED}✗ cosmic.board entry missing from /etc/hosts${NC}"
    echo ""
    echo -e "${YELLOW}To fix this, run:${NC}"
    echo ""
    echo "sudo sh -c 'echo \"192.168.0.18    cosmic.board\" >> /etc/hosts'"
    echo ""
    echo "Or to sync from zScripts version:"
    echo "sudo cp /Users/sammuthu/zScripts/bin/system-config/hosts /etc/hosts"
fi

echo ""
echo -e "${BLUE}🔍 Checking DNSMasq:${NC}"
echo "--------------------"

# Check if dnsmasq is installed
if brew list dnsmasq &> /dev/null; then
    echo -e "${GREEN}✓ DNSMasq installed${NC}"
    
    # Check if running
    if brew services list | grep -q "dnsmasq.*started"; then
        echo -e "${GREEN}✓ DNSMasq running${NC}"
    else
        echo -e "${YELLOW}⚠ DNSMasq not running${NC}"
        echo "  To start: sudo brew services start dnsmasq"
    fi
    
    # Check configuration
    if [ -f /opt/homebrew/etc/dnsmasq.d/cosmic.conf ]; then
        echo -e "${GREEN}✓ cosmic.conf exists${NC}"
        cat /opt/homebrew/etc/dnsmasq.d/cosmic.conf
    else
        echo -e "${RED}✗ cosmic.conf missing${NC}"
        echo "  Create with: echo 'address=/cosmic.board/192.168.0.18' | sudo tee /opt/homebrew/etc/dnsmasq.d/cosmic.conf"
    fi
else
    echo -e "${RED}✗ DNSMasq not installed${NC}"
    echo "  Install with: brew install dnsmasq"
fi

echo ""
echo -e "${BLUE}🔍 Checking /etc/resolver:${NC}"
echo "--------------------------"

if [ -f /etc/resolver/board ]; then
    echo -e "${GREEN}✓ /etc/resolver/board exists${NC}"
    echo -n "  Content: "
    cat /etc/resolver/board
else
    echo -e "${YELLOW}⚠ /etc/resolver/board missing${NC}"
    echo "  This allows .board domains to use DNSMasq"
    echo "  Create with:"
    echo "    sudo mkdir -p /etc/resolver"
    echo "    echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/board"
fi

echo ""
echo -e "${BLUE}🔍 Checking Nginx:${NC}"
echo "------------------"

# Check nginx config
if [ -f /opt/homebrew/etc/nginx/nginx.conf ]; then
    if grep -q "cosmic.board" /opt/homebrew/etc/nginx/nginx.conf; then
        echo -e "${GREEN}✓ cosmic.board configured in nginx${NC}"
        echo "  Listening on port 8888"
    else
        echo -e "${RED}✗ cosmic.board not in nginx config${NC}"
    fi
else
    echo -e "${RED}✗ Nginx config not found${NC}"
fi

# Check if nginx is running
if brew services list | grep -q "nginx.*started"; then
    echo -e "${GREEN}✓ Nginx running${NC}"
else
    echo -e "${YELLOW}⚠ Nginx not running${NC}"
    echo "  Start with: brew services restart nginx"
fi

echo ""
echo -e "${BLUE}📋 Resolution Order:${NC}"
echo "--------------------"
echo "1. Browser requests cosmic.board"
echo "2. System checks /etc/hosts first"
echo "3. If not in hosts, checks DNS (including DNSMasq via /etc/resolver)"
echo "4. Resolves to 192.168.0.18"
echo "5. Nginx on port 8888 proxies to localhost:7777"

echo ""
echo -e "${BLUE}🚀 Quick Fix Commands:${NC}"
echo "----------------------"

if ! grep -q "cosmic.board" /etc/hosts; then
    echo -e "${YELLOW}1. Add to /etc/hosts:${NC}"
    echo "   sudo sh -c 'echo \"192.168.0.18    cosmic.board\" >> /etc/hosts'"
    echo ""
fi

echo -e "${YELLOW}2. Flush DNS cache:${NC}"
echo "   sudo dscacheutil -flushcache"
echo "   sudo killall -HUP mDNSResponder"
echo ""

echo -e "${YELLOW}3. Test resolution:${NC}"
echo "   ping cosmic.board"
echo "   curl http://cosmic.board:8888"
echo ""

echo -e "${BLUE}✅ Once fixed, access at:${NC}"
echo "   http://cosmic.board:8888"
echo ""