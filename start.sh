#!/bin/bash

# CosmicBoard Environment Startup Script
# Allows selection of environment with 5-second timeout

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Port configuration
PORT=7777
APP_NAME="CosmicBoard Web"
BACKEND_PORT=7779  # Fixed to use correct backend port

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

# ASCII art logo
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════╗
║                                           ║
║     ✨ COSMIC BOARD STARTUP ✨           ║
║                                           ║
╚═══════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Function to set environment
set_environment() {
    local ENV_CHOICE=$1
    
    # Update .env file with chosen environment
    echo "DEFAULT_ENVIRONMENT=${ENV_CHOICE}" > .env
    echo "ENV_WAIT_TIMEOUT=5" >> .env
    
    # Update .env.local with the chosen environment
    if [ -f .env.local ]; then
        # Update existing NEXT_PUBLIC_APP_ENV
        if grep -q "NEXT_PUBLIC_APP_ENV=" .env.local; then
            if [[ "$OSTYPE" == "darwin"* ]]; then
                # macOS sed syntax
                sed -i '' "s/NEXT_PUBLIC_APP_ENV=.*/NEXT_PUBLIC_APP_ENV=${ENV_CHOICE}/" .env.local
            else
                # Linux sed syntax
                sed -i "s/NEXT_PUBLIC_APP_ENV=.*/NEXT_PUBLIC_APP_ENV=${ENV_CHOICE}/" .env.local
            fi
        else
            echo "NEXT_PUBLIC_APP_ENV=${ENV_CHOICE}" >> .env.local
        fi
    fi
    
    echo -e "${GREEN}✓ Environment set to: ${MAGENTA}${ENV_CHOICE}${NC}"
}

# Display environment options
echo -e "${YELLOW}Select environment:${NC}"
echo -e "  ${GREEN}1)${NC} Development ${CYAN}(local services)${NC} ${YELLOW}[DEFAULT]${NC}"
echo -e "  ${GREEN}2)${NC} Staging ${CYAN}(AWS backend)${NC}"
echo -e "  ${GREEN}3)${NC} Production ${CYAN}(fully deployed)${NC}"
echo ""

# Read user choice with timeout
echo -e "${MAGENTA}You have 5 seconds to choose (defaults to Development):${NC}"
if read -t 5 -n 1 -r -s choice; then
    echo ""  # New line after input
    case $choice in
        1)
            ENV_NAME="development"
            ;;
        2)
            ENV_NAME="staging"
            ;;
        3)
            ENV_NAME="production"
            ;;
        *)
            echo -e "${YELLOW}Invalid choice. Using Development.${NC}"
            ENV_NAME="development"
            ;;
    esac
else
    echo ""  # New line after timeout
    echo -e "${CYAN}⏰ Timeout reached. Using Development environment.${NC}"
    ENV_NAME="development"
fi

# Set the environment
set_environment $ENV_NAME

# Show environment-specific configuration
echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Environment Configuration:${NC}"
echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

case $ENV_NAME in
    development)
        echo -e "  ${BLUE}Environment:${NC} Development"
        echo -e "  ${BLUE}API URL:${NC} http://localhost:7779"
        echo -e "  ${BLUE}Storage:${NC} Local filesystem"
        echo -e "  ${BLUE}Database:${NC} PostgreSQL (local)"
        echo -e "  ${BLUE}CORS:${NC} Permissive (development)"
        ;;
    staging)
        echo -e "  ${BLUE}Environment:${NC} Staging"
        echo -e "  ${BLUE}API URL:${NC} https://api-staging.cosmicboard.com"
        echo -e "  ${BLUE}Storage:${NC} AWS S3"
        echo -e "  ${BLUE}Database:${NC} PostgreSQL (AWS RDS)"
        echo -e "  ${BLUE}CORS:${NC} Restricted to staging domains"
        ;;
    production)
        echo -e "  ${BLUE}Environment:${NC} Production"
        echo -e "  ${BLUE}API URL:${NC} https://api.cosmicboard.com"
        echo -e "  ${BLUE}Storage:${NC} AWS S3"
        echo -e "  ${BLUE}Database:${NC} PostgreSQL (AWS RDS)"
        echo -e "  ${BLUE}CORS:${NC} Restricted to production domains"
        ;;
esac

echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

print_status "Starting ${APP_NAME} in ${ENV_NAME} mode..."

# Step 0: Run setup-cosmic-services.sh to ensure all services are properly configured
if [ -f "./setup-cosmic-services.sh" ]; then
    print_status "Running service setup script..."
    ./setup-cosmic-services.sh
    echo ""
    print_success "Service setup completed"
    echo ""
fi

# Kill any existing process on the port
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    print_status "Stopping existing server on port $PORT..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 1
    print_success "Previous server stopped"
fi

# Step 1: Check if backend is needed (only for development)
if [ "$ENV_NAME" = "development" ] && [ "$1" != "--no-backend" ]; then
    # Check if backend is running
    print_status "Checking backend server..."
    
    # Check if --restart-backend flag is set or if RESTART_BACKEND env var is set
    RESTART_BACKEND=false
    if [ "$1" = "--restart-backend" ] || [ "$2" = "--restart-backend" ] || [ "$RESTART_BACKEND" = "true" ]; then
        RESTART_BACKEND=true
    fi
    
    if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
        if [ "$RESTART_BACKEND" = "true" ]; then
            print_warning "Backend is running but restart requested. Restarting backend..."
            # Kill existing backend
            lsof -ti:${BACKEND_PORT} | xargs kill -9 2>/dev/null || true
            sleep 2
        else
            print_success "Backend server is already running on port ${BACKEND_PORT}"
            print_status "Use --restart-backend flag to force restart with new endpoints"
        fi
    fi
    
    # Start backend if not running or if restart was requested
    if ! curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
        print_status "Starting backend server..."
        
        # Check PostgreSQL first
        if docker ps | grep -q "cosmicboard_postgres"; then
            print_success "PostgreSQL is running"
        else
            print_status "Starting PostgreSQL..."
            (cd ../cosmicboard-backend && docker compose up -d)
            sleep 5
        fi
        
        # Ensure Prisma client is generated with new Media model
        print_status "Generating Prisma client..."
        (cd ../cosmicboard-backend && npx prisma generate) > /dev/null 2>&1
        
        # Start backend server in background
        print_status "Starting backend server with media endpoints..."
        (cd ../cosmicboard-backend && npm run dev > /dev/null 2>&1) &
        BACKEND_PID=$!
        
        # Wait for backend to be ready
        print_status "Waiting for backend to be ready..."
        for i in {1..30}; do
            if curl -s http://localhost:${BACKEND_PORT}/api/health > /dev/null 2>&1; then
                print_success "Backend is ready with media endpoints!"
                # Test media endpoint
                if curl -s http://localhost:${BACKEND_PORT}/api/media > /dev/null 2>&1; then
                    print_success "Media endpoints verified ✓"
                fi
                break
            fi
            if [ $i -eq 30 ]; then
                print_error "Backend failed to start after 30 seconds"
                exit 1
            fi
            sleep 1
        done
    fi
elif [ "$ENV_NAME" = "staging" ]; then
    print_status "Using staging backend at https://api-staging.cosmicboard.com"
    # Test staging backend connection
    if curl -s https://api-staging.cosmicboard.com/api/health > /dev/null 2>&1; then
        print_success "Connected to staging backend"
    else
        print_warning "Staging backend not accessible - check your network connection"
    fi
elif [ "$ENV_NAME" = "production" ]; then
    print_status "Using production backend at https://api.cosmicboard.com"
    # Test production backend connection
    if curl -s https://api.cosmicboard.com/api/health > /dev/null 2>&1; then
        print_success "Connected to production backend"
    else
        print_warning "Production backend not accessible - check your network connection"
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

# Check nginx (only for development)
if [ "$ENV_NAME" = "development" ]; then
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
fi

echo ""
print_status "Access URLs:"
echo "----------------"

case $ENV_NAME in
    development)
        echo -e "Frontend:     ${GREEN}http://localhost:${PORT}${NC}"
        echo -e "Via Nginx:    ${GREEN}https://cosmic.board${NC}"
        echo -e "Backend API:  ${GREEN}http://localhost:${BACKEND_PORT}/api${NC}"
        echo -e "Mobile App:   ${GREEN}http://localhost:8082${NC}"
        ;;
    staging)
        echo -e "Frontend:     ${GREEN}http://localhost:${PORT}${NC}"
        echo -e "Backend API:  ${GREEN}https://api-staging.cosmicboard.com${NC}"
        ;;
    production)
        echo -e "Web:          ${GREEN}https://cosmicboard.com${NC}"
        echo -e "Backend API:  ${GREEN}https://api.cosmicboard.com${NC}"
        echo -e "Mobile:       ${GREEN}App Store / Play Store${NC}"
        ;;
esac

echo ""

# Step 5: Start the appropriate server
if [ "$ENV_NAME" = "production" ]; then
    print_status "Building for production..."
    npm run build
    
    if [ $? -ne 0 ]; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Build completed successfully"
    print_status "Starting production server on port ${PORT}..."
    npm run start
    
elif [ "$ENV_NAME" = "staging" ]; then
    print_status "Starting staging environment on port ${PORT}..."
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
    
else
    print_status "Starting development server on port ${PORT}..."
    echo ""
    print_status "Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi