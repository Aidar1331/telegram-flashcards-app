# 📚 Telegram Flashcards Mini App

AI-powered flashcard generator that creates interactive learning cards from files and text using Claude API. Built as a Telegram Mini App with modern React frontend and Node.js backend.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

### 🎯 Core Functionality
- **File Upload Support**: PDF, DOCX, and TXT files (up to 1MB)
- **Text Input**: Direct text input (up to 10,000 characters)
- **AI-Powered Generation**: Uses Claude API to create 5-15 intelligent flashcards
- **Interactive 3D Cards**: Beautiful card flip animations with perspective effects
- **Keyboard Navigation**: Arrow keys and spacebar support for seamless learning

### 🎨 User Experience
- **Telegram Integration**: Full WebApp API integration with theme support
- **Responsive Design**: Mobile-first design that works perfectly on all devices
- **Progress Indicators**: Real-time feedback during card generation
- **Error Handling**: User-friendly error messages and validation
- **Accessibility**: Keyboard navigation and screen reader support

### 🔒 Security & Performance
- **Telegram Validation**: HMAC-SHA256 validation of Telegram initData
- **Rate Limiting**: Protection against abuse and excessive requests
- **File Validation**: Strict file type and size validation
- **CORS Protection**: Secure cross-origin request handling
- **Environment Isolation**: Secure API key management

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- npm or yarn
- Claude API key from [Anthropic Console](https://console.anthropic.com/)
- Telegram Bot token from [@BotFather](https://t.me/botfather)

### One-Command Setup
```bash
git clone <your-repo-url>
cd flashcards
./scripts/install.sh
```

### Manual Setup
```bash
# Install dependencies
npm run install:all

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your API keys

# Start development servers
npm run dev
```

## 📁 Project Structure

```
flashcards/
├── 📂 backend/                 # Node.js Express API server
│   ├── server.js              # Main server file with all endpoints
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables (create from .env.example)
│   └── .env.example           # Environment template
├── 📂 frontend/               # React Vite application
│   ├── src/
│   │   ├── App.jsx            # Main React component with all functionality
│   │   ├── App.css            # 3D animations and styling
│   │   └── index.css          # Global styles with Tailwind
│   ├── index.html             # HTML template with Telegram WebApp integration
│   ├── package.json           # Frontend dependencies
│   └── vite.config.js         # Vite configuration with API proxy
├── 📂 scripts/                # Automation scripts
│   ├── install.sh             # Complete setup automation
│   ├── deploy.sh              # Multi-platform deployment
│   └── setup-telegram.sh      # Telegram bot configuration guide
├── 📂 configs/                # Deployment configurations
│   ├── railway.toml           # Railway deployment config
│   └── render.yaml            # Render deployment config
├── 📂 docs/                   # Documentation
│   ├── API.md                 # API documentation
│   └── DEPLOYMENT.md          # Deployment guide
├── vercel.json                # Vercel deployment config
├── package.json               # Root package with scripts
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables

Create `backend/.env` with your API keys:

```env
# Claude API Configuration
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here

# Telegram Bot Configuration  
TELEGRAM_BOT_TOKEN=your:telegram-bot-token-here

# Server Configuration
PORT=3001
NODE_ENV=development
```

### API Keys Setup

1. **Claude API Key**:
   - Visit [Anthropic Console](https://console.anthropic.com/)
   - Create an account and generate an API key
   - Add to `CLAUDE_API_KEY` in your `.env` file

2. **Telegram Bot Token**:
   - Message [@BotFather](https://t.me/botfather) on Telegram
   - Create a new bot with `/newbot`
   - Copy the token to `TELEGRAM_BOT_TOKEN` in your `.env` file

## 🎮 Usage

### Development
```bash
# Start both frontend and backend
npm run dev

# Start individual services
npm run dev:frontend  # Frontend only (http://localhost:5173)
npm run dev:backend   # Backend only (http://localhost:3001)
```

### Production Build
```bash
# Build frontend for production
npm run build

# Start production server
npm start
```

### Testing
```bash
# Test backend health
curl http://localhost:3001/api/health

# Test flashcard generation
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "text=Machine learning is a method of data analysis that automates analytical model building."
```

## 🌐 Deployment

### Automated Deployment
```bash
./scripts/deploy.sh
```

Choose from:
1. **Vercel** (Recommended) - Automatic with zero configuration
2. **Railway** - Simple with built-in database options
3. **Render** - Free tier available with static + web service

### Platform-Specific Guides

#### Vercel (Recommended)
```bash
npm install -g vercel
vercel login
vercel --prod
```

#### Railway
```bash
npm install -g @railway/cli
railway login
railway up
```

#### Render
1. Connect your GitHub repository to Render
2. Use the provided `render.yaml` configuration
3. Set environment variables in dashboard

### Environment Variables for Production

Set these in your deployment platform:
- `CLAUDE_API_KEY`: Your Claude API key
- `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
- `NODE_ENV`: Set to "production"

## 🤖 Telegram Bot Setup

### Quick Setup
```bash
./scripts/setup-telegram.sh
```

### Manual Setup with @BotFather

1. **Create Bot**: Message [@BotFather](https://t.me/botfather) → `/newbot`
2. **Create Mini App**: `/newapp` → Follow prompts
3. **Set Web App URL**: Use your deployment URL
4. **Configure Menu Button**: `/setmenubutton` → Set Mini App URL
5. **Test**: Search for your bot and try the Mini App

### Bot Commands
Set these commands with @BotFather using `/setcommands`:
```
start - Start creating flashcards
help - Get help and instructions
about - About this bot
```

## 📖 API Documentation

### POST `/api/generate-flashcards`

Generate flashcards from file or text input.

**Request:**
```bash
# File upload
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "file=@document.pdf" \
  -F "initData=telegram_init_data_string"

# Text input
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "text=Your learning content here" \
  -F "initData=telegram_init_data_string"
```

**Response:**
```json
{
  "success": true,
  "flashcards": [
    {
      "front": "What is machine learning?",
      "back": "A method of data analysis that automates analytical model building using algorithms that iteratively learn from data."
    }
  ],
  "count": 8
}
```

**Error Response:**
```json
{
  "error": "File size too large. Maximum size is 1MB."
}
```

### GET `/api/health`

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

## 🎨 Features Deep Dive

### 3D Card Animations
- **CSS3 Transforms**: Using `perspective` and `transform-style: preserve-3d`
- **Smooth Transitions**: 0.6s flip animation with easing
- **Interactive Hover**: Subtle elevation effects on hover
- **Responsive Design**: Optimized for both desktop and mobile

### File Processing
- **PDF**: Text extraction using `pdf-parse`
- **DOCX**: Document parsing with `mammoth.js`
- **TXT**: Direct UTF-8 text reading
- **Validation**: File type and size checking before processing

### AI Integration
- **Claude 3 Sonnet**: Latest model for optimal flashcard generation
- **Smart Prompting**: Tailored prompts for educational content extraction
- **Error Handling**: Robust error handling with fallback strategies
- **Rate Limiting**: Built-in protection against API abuse

## 🔒 Security

### Data Protection
- **No Data Storage**: Files are processed and immediately deleted
- **Temporary Processing**: All uploads stored temporarily in memory
- **API Key Security**: Environment variables with no client exposure
- **CORS Protection**: Restricted origins for API access

### Telegram Security
- **InitData Validation**: HMAC-SHA256 validation of Telegram data
- **Origin Validation**: Ensures requests come from Telegram WebApp
- **Token Protection**: Bot token secured server-side only

## 🚀 Performance

### Optimization Features
- **Frontend**: Vite build optimization with tree shaking
- **Backend**: Express with efficient middleware stack
- **Caching**: Static asset caching and API response optimization
- **Lazy Loading**: Component lazy loading for faster initial load

### Monitoring
- **Health Checks**: Built-in health monitoring endpoint
- **Error Tracking**: Comprehensive error logging
- **Performance Metrics**: Request timing and success rates

## 🛠️ Development

### Code Style
- **ESLint**: JavaScript linting with React rules
- **Prettier**: Code formatting (run `npm run format`)
- **Git Hooks**: Pre-commit hooks for quality assurance

### Testing
```bash
# Run all tests
npm test

# Backend API tests
cd backend && npm test

# Frontend component tests  
cd frontend && npm test
```

### Contributing
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📚 Additional Resources

### Documentation
- [API Documentation](docs/API.md) - Detailed API reference
- [Deployment Guide](docs/DEPLOYMENT.md) - Platform-specific deployment
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps) - Official documentation

### Support
- [Issues](https://github.com/your-username/flashcards/issues) - Bug reports and feature requests
- [Discussions](https://github.com/your-username/flashcards/discussions) - Community support
- [Telegram](https://t.me/your_support_channel) - Real-time support

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com/) for Claude API
- [Telegram](https://telegram.org/) for Bot API and Mini Apps platform
- [Vercel](https://vercel.com/) for excellent hosting platform
- [React](https://reactjs.org/) and [Vite](https://vitejs.dev/) for frontend framework
- [Express.js](https://expressjs.com/) for backend framework

---

**Built with ❤️ for the learning community**

Ready to transform your learning materials into interactive flashcards? Get started now! 🚀