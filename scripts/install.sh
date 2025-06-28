#!/bin/bash

# Telegram Flashcards App Installation Script
# This script sets up the complete development environment

set -e  # Exit on any error

echo "🚀 Setting up Telegram Flashcards App..."
echo "======================================"

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

# Check if Node.js is installed
print_info "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$MAJOR_VERSION" -lt 18 ]; then
    print_error "Node.js version $NODE_VERSION is too old. Please install Node.js 18 or higher."
    exit 1
fi

print_status "Node.js $NODE_VERSION is installed"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm."
    exit 1
fi

print_status "npm $(npm -v) is installed"

# Install root dependencies
print_info "Installing root dependencies..."
npm install
print_status "Root dependencies installed"

# Install backend dependencies
print_info "Installing backend dependencies..."
cd backend
npm install
print_status "Backend dependencies installed"

# Install frontend dependencies
print_info "Installing frontend dependencies..."
cd ../frontend
npm install
print_status "Frontend dependencies installed"

# Return to root directory
cd ..

# Create .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    print_info "Creating backend/.env file..."
    cp backend/.env.example backend/.env
    print_warning "Please edit backend/.env file with your API keys"
else
    print_status "Backend .env file already exists"
fi

# Check if .env file has placeholder values
if grep -q "your_claude_api_key_here" backend/.env; then
    print_warning "Please update backend/.env with your actual Claude API key"
fi

if grep -q "your_telegram_bot_token_here" backend/.env; then
    print_warning "Please update backend/.env with your actual Telegram Bot token"
fi

# Make scripts executable
print_info "Making scripts executable..."
chmod +x scripts/*.sh
print_status "Scripts are now executable"

# Verify installation
print_info "Verifying installation..."

# Check if backend can start (dry run)
cd backend
if npm list --depth=0 &> /dev/null; then
    print_status "Backend dependencies verified"
else
    print_error "Backend dependencies verification failed"
    exit 1
fi

# Check if frontend can build (dry run)
cd ../frontend
if npm list --depth=0 &> /dev/null; then
    print_status "Frontend dependencies verified"
else
    print_error "Frontend dependencies verification failed"
    exit 1
fi

cd ..

echo ""
echo "🎉 Installation completed successfully!"
echo "======================================"
echo ""
print_info "Next steps:"
echo "1. Update backend/.env with your API keys:"
echo "   - CLAUDE_API_KEY (get from https://console.anthropic.com/)"
echo "   - TELEGRAM_BOT_TOKEN (get from @BotFather on Telegram)"
echo ""
echo "2. Start development servers:"
echo "   npm run dev"
echo ""
echo "3. Open your browser to http://localhost:5173"
echo ""
echo "4. For production deployment, run:"
echo "   ./scripts/deploy.sh"
echo ""
print_status "Happy coding! 🚀"