#!/bin/bash

# CosmicBoard Web Frontend Startup Script
# This script handles the startup process for the web frontend

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Port configuration
PORT=7777
APP_NAME="CosmicBoard Web"
BACKEND_PORT=7778

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_status "Starting ${APP_NAME}..."

# Kill any existing process on the port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    print_status "Stopping existing server on port $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
    print_success "Previous server stopped"
fi

# Step 1: Check if backend is needed (default yes, unless --no-backend flag)
if [ "$1" != "--no-backend" ]; then
    # Check if backend is running
    print_status "Checking backend server..."
    if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
        print_success "Backend server is already running on port ${BACKEND_PORT}"
    else
        print_status "Backend server not running. Starting backend..."
        
        # Check PostgreSQL first
        if docker ps | grep -q "cosmicboard_postgres"; then
            print_success "PostgreSQL is running"
        else
            print_status "Starting PostgreSQL..."
            (cd ../cosmicboard-backend && docker compose up -d)
            sleep 5
        fi
        
        # Start backend server in background
        print_status "Starting backend server..."
        (cd ../cosmicboard-backend && npm run dev > /dev/null 2>&1) &
        BACKEND_PID=$!
        
        # Wait for backend to be ready
        print_status "Waiting for backend to be ready..."
        for i in {1..30}; do
            if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
                print_success "Backend is ready!"
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "Backend failed to start after 30 seconds"
                exit 1
            fi
            sleep 1
        done
    fi
fi

# Step 2: Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm install --legacy-peer-deps
    print_success "Dependencies installed"
else
    print_success "Dependencies already installed"
fi

# Step 3: Check environment configuration
if [ -f .env.local ]; then
    print_success "Environment configuration found"
else
    print_warning "No .env.local file found. Using default settings."
fi

# Step 4: Service Status
echo ""
print_status "Service Status:"
echo "-------------------"

# Check nginx
echo -n "Nginx: "
if nginx -t 2>/dev/null; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${YELLOW}⚠ Not configured${NC}"
fi

# Check backend
echo -n "Backend API (port ${BACKEND_PORT}): "
if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Running${NC}"
else
    echo -e "${RED}✗ Not running${NC}"
fi

echo ""
print_status "Access URLs:"
echo "----------------"
echo -e "Frontend:     ${GREEN}http://localhost:${PORT}${NC}"
echo -e "Via Nginx:    ${GREEN}http://cosmic.board${NC}"
echo -e "Backend API:  ${GREEN}http://localhost:${BACKEND_PORT}/api${NC}"
echo ""

# Step 5: Start the appropriate server
if [ "$2" = "build" ] || [ "$1" = "build" ]; then
    print_status "Building for production..."
    npm run build
    
    if [ $? -ne 0 ]; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Build completed successfully"
    print_status "Starting production server on port ${PORT}..."
    npm run start
    
elif [ "$2" = "prod" ] || [ "$1" = "prod" ]; then
    print_status "Starting production server on port ${PORT}..."
    npm run start
    
else
    print_status "Starting development server on port ${PORT}..."
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi