#!/bin/bash

# Telegram Bot Setup Instructions Script
# This script provides step-by-step instructions for setting up Telegram bot

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "${BLUE}📋 Step $1:${NC} $2"
}

print_info() {
    echo -e "${GREEN}ℹ️${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

print_command() {
    echo -e "${YELLOW}Command:${NC} $1"
}

echo "🤖 Telegram Bot & Mini App Setup Guide"
echo "======================================"
echo ""

print_step "1" "Create a new Telegram Bot with @BotFather"
echo ""
print_info "Open Telegram and search for @BotFather"
print_command "/start"
print_command "/newbot"
echo ""
print_info "Follow the prompts to:"
echo "- Enter your bot name (e.g., 'Flashcards Learning Bot')"
echo "- Enter your bot username (e.g., 'flashcards_learning_bot')"
echo ""
print_warning "Save the bot token that @BotFather gives you!"
echo ""

print_step "2" "Configure your bot settings"
echo ""
print_command "/setdescription"
print_info "Set description: 'Create learning flashcards from files and text using AI'"
echo ""
print_command "/setabouttext"
print_info "Set about: 'AI-powered flashcard generator for effective learning'"
echo ""
print_command "/setuserpic"
print_info "Upload a bot profile picture (optional)"
echo ""

print_step "3" "Create a Mini App"
echo ""
print_command "/newapp"
print_info "Select your bot from the list"
print_info "Enter app title: 'Flashcards Generator'"
print_info "Enter app description: 'Generate learning flashcards from files and text'"
print_info "Upload app icon (512x512 PNG recommended)"
echo ""
print_warning "You'll need your deployment URL for the next step!"
echo ""

print_step "4" "Configure Mini App URL"
echo ""
print_info "After deployment, come back to @BotFather and:"
print_command "/editapp"
print_info "Select your bot → Select your app → Edit Web App URL"
print_info "Enter your deployment URL (e.g., https://your-app.vercel.app)"
echo ""

print_step "5" "Set up Menu Button (Optional)"
echo ""
print_command "/setmenubutton"
print_info "Select your bot"
print_info "Choose to edit menu button"
print_info "Set button text: '📚 Create Flashcards'"
print_info "Set Mini App URL: your deployment URL"
echo ""

print_step "6" "Configure Bot Commands"
echo ""
print_command "/setcommands"
print_info "Select your bot and set these commands:"
echo ""
echo "start - Start creating flashcards"
echo "help - Get help and instructions"
echo "about - About this bot"
echo ""

print_step "7" "Privacy Settings"
echo ""
print_command "/setprivacy"
print_info "Select your bot"
print_info "Choose 'Disable' to allow the bot to work in groups"
print_info "Or 'Enable' to restrict to private chats only"
echo ""

print_step "8" "Test Your Bot"
echo ""
print_info "Search for your bot in Telegram"
print_command "/start"
print_info "Try the menu button or Mini App"
print_info "Upload a test file or enter some text"
print_info "Verify that flashcards are generated correctly"
echo ""

echo "🎯 Additional Configuration Tips"
echo "==============================="
echo ""

print_info "Environment Variables to Set:"
echo "- TELEGRAM_BOT_TOKEN: Your bot token from @BotFather"
echo "- CLAUDE_API_KEY: Your Claude API key from Anthropic"
echo ""

print_info "Telegram Bot Features:"
echo "- File uploads (PDF, DOCX, TXT up to 1MB)"
echo "- Text input (up to 10,000 characters)"
echo "- 3D interactive flashcards"
echo "- Keyboard navigation support"
echo "- Telegram theme integration"
echo ""

print_info "Security Features:"
echo "- Telegram initData validation"
echo "- File type and size validation"
echo "- Rate limiting protection"
echo "- CORS protection"
echo ""

echo "🔗 Useful Links"
echo "==============="
echo ""
echo "• @BotFather: https://t.me/botfather"
echo "• Telegram Bot API: https://core.telegram.org/bots/api"
echo "• Mini Apps Guide: https://core.telegram.org/bots/webapps"
echo "• Claude API: https://console.anthropic.com/"
echo ""

print_warning "Important Notes:"
echo "- Keep your bot token secret and secure"
echo "- Test thoroughly before making your bot public"
echo "- Monitor usage and implement rate limiting as needed"
echo "- Consider implementing user authentication for production use"
echo ""

echo "✅ Setup guide completed!"
echo ""
print_info "Once you've completed these steps, your Telegram Mini App will be ready to use!"
print_info "Users can access it through your bot's menu button or by typing /start"