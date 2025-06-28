#!/bin/bash

# Telegram Flashcards App Deployment Script
# This script handles deployment to various platforms

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

echo "🚀 Telegram Flashcards App Deployment"
echo "===================================="
echo ""

# Check if .env file exists and has valid keys
if [ ! -f "backend/.env" ]; then
    print_error "backend/.env file not found. Please run ./scripts/install.sh first."
    exit 1
fi

if grep -q "your_claude_api_key_here" backend/.env || grep -q "your_telegram_bot_token_here" backend/.env; then
    print_error "Please update backend/.env with your actual API keys before deployment."
    exit 1
fi

print_status ".env file configured"

# Ask user to choose deployment platform
echo "Choose deployment platform:"
echo "1) Vercel (Recommended)"
echo "2) Railway"
echo "3) Render"
echo "4) Manual build only"
echo ""
read -p "Enter your choice (1-4): " PLATFORM_CHOICE

case $PLATFORM_CHOICE in
    1)
        PLATFORM="vercel"
        ;;
    2)
        PLATFORM="railway"
        ;;
    3)
        PLATFORM="render"
        ;;
    4)
        PLATFORM="manual"
        ;;
    *)
        print_error "Invalid choice. Exiting."
        exit 1
        ;;
esac

print_info "Selected platform: $PLATFORM"

# Build frontend
print_info "Building frontend..."
cd frontend
npm run build
print_status "Frontend built successfully"
cd ..

# Platform-specific deployment
case $PLATFORM in
    "vercel")
        print_info "Deploying to Vercel..."
        
        # Check if Vercel CLI is installed
        if ! command -v vercel &> /dev/null; then
            print_warning "Vercel CLI not found. Installing..."
            npm install -g vercel
        fi
        
        # Read environment variables from .env
        source backend/.env
        
        print_info "Setting up environment variables..."
        vercel env add CLAUDE_API_KEY production <<< "$CLAUDE_API_KEY"
        vercel env add TELEGRAM_BOT_TOKEN production <<< "$TELEGRAM_BOT_TOKEN"
        vercel env add NODE_ENV production <<< "production"
        
        print_info "Deploying to Vercel..."
        vercel --prod
        
        print_status "Deployment to Vercel completed!"
        ;;
        
    "railway")
        print_info "Deploying to Railway..."
        
        # Check if Railway CLI is installed
        if ! command -v railway &> /dev/null; then
            print_error "Railway CLI not found. Please install it first:"
            echo "npm install -g @railway/cli"
            echo "Then run: railway login"
            exit 1
        fi
        
        # Check if logged in to Railway
        if ! railway whoami &> /dev/null; then
            print_error "Not logged in to Railway. Please run: railway login"
            exit 1
        fi
        
        # Create railway project if not exists
        if [ ! -f "railway.toml" ]; then
            cp configs/railway.toml .
        fi
        
        print_info "Deploying to Railway..."
        railway up
        
        print_warning "Don't forget to set environment variables in Railway dashboard:"
        echo "- CLAUDE_API_KEY"
        echo "- TELEGRAM_BOT_TOKEN"
        
        print_status "Deployment to Railway initiated!"
        ;;
        
    "render")
        print_info "Deploying to Render..."
        
        if [ ! -f "render.yaml" ]; then
            cp configs/render.yaml .
        fi
        
        print_warning "For Render deployment:"
        echo "1. Push your code to GitHub"
        echo "2. Connect your GitHub repo to Render"
        echo "3. Set environment variables in Render dashboard:"
        echo "   - CLAUDE_API_KEY"
        echo "   - TELEGRAM_BOT_TOKEN"
        echo "4. Deploy using the render.yaml configuration"
        
        print_status "Render configuration prepared!"
        ;;
        
    "manual")
        print_info "Manual build completed. Files are ready for deployment:"
        echo "- Frontend: frontend/dist/"
        echo "- Backend: backend/"
        print_status "Manual build completed!"
        ;;
esac

# Health check function
perform_health_check() {
    local url=$1
    print_info "Performing health check on $url..."
    
    for i in {1..5}; do
        if curl -s "$url/api/health" > /dev/null; then
            print_status "Health check passed!"
            return 0
        else
            print_warning "Health check attempt $i failed. Retrying in 10 seconds..."
            sleep 10
        fi
    done
    
    print_error "Health check failed after 5 attempts."
    return 1
}

# Ask for deployment URL for health check
if [ "$PLATFORM" != "manual" ]; then
    echo ""
    read -p "Enter your deployment URL for health check (optional): " DEPLOYMENT_URL
    
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        perform_health_check "$DEPLOYMENT_URL"
    fi
fi

echo ""
echo "🎉 Deployment process completed!"
echo "==============================="
echo ""

case $PLATFORM in
    "vercel")
        print_info "Your app should be live on Vercel!"
        print_info "Next steps:"
        echo "1. Get your Vercel URL from the deployment output"
        echo "2. Configure your Telegram bot with @BotFather"
        echo "3. Set the Mini App URL in @BotFather"
        ;;
    "railway")
        print_info "Your app is deploying on Railway!"
        print_info "Next steps:"
        echo "1. Set environment variables in Railway dashboard"
        echo "2. Get your Railway URL from the dashboard"
        echo "3. Configure your Telegram bot with @BotFather"
        ;;
    "render")
        print_info "Render configuration is ready!"
        print_info "Next steps:"
        echo "1. Push to GitHub and connect to Render"
        echo "2. Set environment variables in Render dashboard"
        echo "3. Deploy and get your Render URL"
        echo "4. Configure your Telegram bot with @BotFather"
        ;;
    "manual")
        print_info "Manual build completed!"
        print_info "Next steps:"
        echo "1. Deploy frontend/dist/ to your static hosting"
        echo "2. Deploy backend/ to your Node.js hosting"
        echo "3. Configure environment variables on your hosting"
        echo "4. Configure your Telegram bot with @BotFather"
        ;;
esac

echo ""
print_status "Deployment script completed! 🚀"