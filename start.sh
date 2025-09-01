#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Port configuration
PORT=3355

echo -e "${BLUE}🚀 Starting Sam Muthu's Dev Site...${NC}"
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
    npm install
    
    # Install additional required dependencies
    echo -e "${BLUE}📦 Installing @tailwindcss/typography...${NC}"
    npm install -D @tailwindcss/typography
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
    echo ""
fi

# Check if running in development or production
if [ "$1" = "build" ]; then
    echo -e "${BLUE}🔨 Building for production...${NC}"
    npm run build
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Build completed successfully${NC}"
    echo -e "${BLUE}🌐 Starting production server...${NC}"
    npm run start
    
elif [ "$1" = "prod" ]; then
    echo -e "${BLUE}🌐 Starting production server...${NC}"
    npm run start
    
else
    echo -e "${BLUE}🔧 Starting development server...${NC}"
    echo -e "${BLUE}📱 Site will be available at: http://localhost:3355${NC}"
    echo ""
    npm run dev
fi