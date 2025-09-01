#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Port configuration
PORT=7777
APP_NAME="CosmicBoard"

echo -e "${BLUE}🚀 Starting ${APP_NAME}...${NC}"
echo ""

# Kill any existing process on the port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${BLUE}🛑 Stopping existing server on port $PORT...${NC}"
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}✅ Previous server stopped${NC}"
    echo ""
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing dependencies...${NC}"
    npm install --legacy-peer-deps
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    echo ""
fi

# Check MongoDB connection
echo -e "${BLUE}🔍 Checking MongoDB connection...${NC}"
if [ -z "$MONGODB_URI" ]; then
    if [ -f .env.local ]; then
        source .env.local
    fi
    if [ -z "$MONGODB_URI" ]; then
        echo -e "${YELLOW}⚠️  MONGODB_URI not set, using default: mongodb://localhost:27017/cosmicboard${NC}"
    fi
fi

# Check service status
echo ""
echo -e "${BLUE}📊 Service Status:${NC}"
echo -e "-------------------"

# Check nginx
echo -n "Nginx (port 8888): "
if brew services list | grep -q "nginx.*started"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not running${NC}"
fi

# Check dnsmasq
echo -n "DNSMasq: "
if ps aux | grep -q "[d]nsmasq"; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not running${NC}"
fi

echo ""
echo -e "${BLUE}🌐 Access URLs:${NC}"
echo -e "----------------"
echo -e "Direct:       ${GREEN}http://localhost:$PORT${NC}"
echo -e "Network:      ${GREEN}http://192.168.0.18:$PORT${NC}"
echo -e "Via Nginx:    ${GREEN}http://192.168.0.18:8888${NC}"
echo -e "Domain:       ${GREEN}http://cosmic.board:8888${NC}"
echo ""

# Check if running in development or production
if [ "$1" = "build" ]; then
    echo -e "${BLUE}🔨 Building for production...${NC}"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build completed successfully${NC}"
    echo -e "${BLUE}🌐 Starting production server on port $PORT...${NC}"
    npm run start
    
elif [ "$1" = "prod" ]; then
    echo -e "${BLUE}🌐 Starting production server on port $PORT...${NC}"
    npm run start
    
else
    echo -e "${BLUE}🔧 Starting development server on port $PORT...${NC}"
    echo ""
    npm run dev
fi