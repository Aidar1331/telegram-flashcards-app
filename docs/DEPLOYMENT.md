# 🚀 Deployment Guide

Complete guide for deploying the Telegram Flashcards Mini App to various platforms.

## 📋 Prerequisites

Before deploying, ensure you have:

- [x] Claude API key from [Anthropic Console](https://console.anthropic.com/)
- [x] Telegram Bot token from [@BotFather](https://t.me/botfather)
- [x] Completed local development and testing
- [x] Built and tested the frontend application

## 🎯 Platform Comparison

| Platform | Pros | Cons | Best For |
|----------|------|------|----------|
| **Vercel** | Zero-config, excellent performance, free SSL | Limited backend execution time | Frontend + light API |
| **Railway** | Simple setup, database included, generous free tier | Smaller community | Full-stack apps |
| **Render** | Good free tier, automatic deploys from Git | Can be slower on free tier | Cost-effective hosting |
| **Heroku** | Mature platform, many add-ons | No free tier anymore | Enterprise apps |

## 🚀 Automated Deployment

### Quick Deploy Script
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Run automated deployment
./scripts/deploy.sh
```

The script will:
1. Build the frontend
2. Let you choose deployment platform
3. Set up environment variables
4. Deploy to your chosen platform
5. Perform health checks

## 🔧 Platform-Specific Guides

### 1. Vercel (Recommended)

**Best for**: Frontend-heavy applications with serverless functions

#### Prerequisites
```bash
npm install -g vercel
```

#### Automated Deployment
```bash
# Login to Vercel
vercel login

# Deploy with environment variables
vercel --prod

# Set environment variables
vercel env add CLAUDE_API_KEY production
vercel env add TELEGRAM_BOT_TOKEN production
vercel env add NODE_ENV production
```

#### Manual Configuration

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. **Configure vercel.json** (already included):
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "frontend/package.json",
         "use": "@vercel/static-build",
         "config": { "distDir": "dist" }
       },
       {
         "src": "backend/server.js",
         "use": "@vercel/node"
       }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/backend/server.js" },
       { "src": "/(.*)", "dest": "/frontend/dist/$1" }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   # Build frontend
   cd frontend && npm run build && cd ..
   
   # Deploy to Vercel
   vercel --prod
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add CLAUDE_API_KEY production
   vercel env add TELEGRAM_BOT_TOKEN production
   vercel env add NODE_ENV production
   ```

#### Domain Configuration
```bash
# Add custom domain (optional)
vercel domains add yourdomain.com
```

---

### 2. Railway

**Best for**: Full-stack applications with database needs

#### Prerequisites
```bash
npm install -g @railway/cli
```

#### Deployment Steps

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Project**:
   ```bash
   railway init
   ```

3. **Configure railway.toml** (already included):
   ```toml
   [build]
   builder = "NIXPACKS"
   
   [deploy]
   startCommand = "cd backend && npm start"
   healthcheckPath = "/api/health"
   ```

4. **Deploy**:
   ```bash
   railway up
   ```

5. **Set Environment Variables** in Railway Dashboard:
   - `CLAUDE_API_KEY`: Your Claude API key
   - `TELEGRAM_BOT_TOKEN`: Your bot token
   - `NODE_ENV`: production

#### Railway Dashboard Configuration
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Select your project
3. Go to Variables tab
4. Add environment variables

---

### 3. Render

**Best for**: Cost-effective hosting with good free tier

#### Deployment Steps

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Account**:
   - Visit [Render.com](https://render.com)
   - Connect your GitHub account

3. **Configure Services**:
   
   **Backend Service**:
   ```yaml
   name: telegram-flashcards-backend
   type: web
   env: node
   buildCommand: cd backend && npm install
   startCommand: cd backend && npm start
   ```
   
   **Frontend Service**:
   ```yaml
   name: telegram-flashcards-frontend
   type: static
   buildCommand: cd frontend && npm install && npm run build
   staticPublishPath: frontend/dist
   ```

4. **Set Environment Variables** in Render Dashboard:
   - `CLAUDE_API_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `NODE_ENV=production`

#### Using render.yaml (Included)
The project includes a `render.yaml` file for easy deployment:
1. Copy `configs/render.yaml` to project root
2. Push to GitHub
3. Connect repository in Render
4. Render will automatically use the configuration

---

### 4. Heroku

**Best for**: Enterprise applications with add-on ecosystem

#### Prerequisites
```bash
npm install -g heroku
```

#### Deployment Steps

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create Application**:
   ```bash
   heroku create your-app-name
   ```

3. **Configure Buildpacks**:
   ```bash
   heroku buildpacks:add --index 1 heroku/nodejs
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set CLAUDE_API_KEY=your_key_here
   heroku config:set TELEGRAM_BOT_TOKEN=your_token_here
   heroku config:set NODE_ENV=production
   ```

5. **Create Procfile**:
   ```
   web: cd backend && npm start
   ```

6. **Deploy**:
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

---

## 🔐 Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `CLAUDE_API_KEY` | Claude API key from Anthropic | `sk-ant-api03-...` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | `7514765823:AAG...` |
| `NODE_ENV` | Environment mode | `production` |
| `PORT` | Server port (usually auto-set) | `3001` |

### Setting Variables by Platform

#### Vercel
```bash
vercel env add VARIABLE_NAME production
```

#### Railway
```bash
railway variables set VARIABLE_NAME=value
```

#### Render
Set in dashboard under Environment tab

#### Heroku
```bash
heroku config:set VARIABLE_NAME=value
```

### Environment File Template
```env
CLAUDE_API_KEY=sk-ant-api03-your-claude-api-key-here
TELEGRAM_BOT_TOKEN=your:telegram-bot-token-here
NODE_ENV=production
PORT=3001
```

## 🧪 Testing Deployment

### Health Check
```bash
curl https://your-deployment-url.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

### Functionality Test
```bash
curl -X POST https://your-deployment-url.com/api/generate-flashcards \
  -F "text=Machine learning is a powerful technology"
```

### Frontend Test
1. Open your deployment URL in browser
2. Try uploading a test file
3. Enter sample text
4. Verify flashcard generation

## 🤖 Telegram Bot Configuration

### Setting Mini App URL

1. **Open @BotFather** on Telegram
2. **Select your bot**: `/myapps` or `/editapp`
3. **Edit Web App URL**: Enter your deployment URL
4. **Test**: Open your bot and try the Mini App

### Menu Button Configuration
```
/setmenubutton
Choose your bot
Edit menu button
Button text: 📚 Create Flashcards
Mini App URL: https://your-deployment-url.com
```

### Bot Commands
```
/setcommands
start - Start creating flashcards
help - Get help and instructions
about - About this bot
```

## 🔍 Monitoring & Maintenance

### Health Monitoring

Set up monitoring for:
- **Uptime**: Monitor `/api/health` endpoint
- **Response Time**: Track API response times
- **Error Rate**: Monitor error logs

### Log Monitoring

Check logs regularly for:
- Claude API errors
- File processing issues
- Rate limiting violations
- Security alerts

### Platform-Specific Monitoring

#### Vercel
- Use Vercel Analytics
- Monitor function execution time
- Check serverless function logs

#### Railway
- Use Railway metrics dashboard
- Monitor memory and CPU usage
- Check deployment logs

#### Render
- Use Render metrics
- Monitor build times
- Check service logs

## 🚨 Troubleshooting

### Common Issues

#### 1. Environment Variables Not Loading
```bash
# Check if variables are set
printenv | grep CLAUDE
printenv | grep TELEGRAM

# Platform-specific checks
vercel env ls
railway variables
```

#### 2. CORS Errors
Update `backend/server.js` CORS configuration:
```javascript
app.use(cors({
  origin: [
    'https://your-deployment-url.com',
    'https://web.telegram.org'
  ]
}));
```

#### 3. File Upload Issues
Check file size limits and MIME types:
```javascript
// Increase if needed (remember hosting limits)
const upload = multer({
  limits: { fileSize: 1024 * 1024 } // 1MB
});
```

#### 4. Claude API Errors
- Verify API key is correct
- Check rate limits
- Monitor API usage in Anthropic console

#### 5. Telegram Integration Issues
- Verify bot token
- Check Mini App URL configuration
- Test initData validation

### Debug Mode

Enable debug logging:
```env
NODE_ENV=development
DEBUG=true
```

### Performance Issues

#### Frontend Optimization
```bash
# Analyze bundle size
cd frontend
npm run build
npx vite-bundle-analyzer dist
```

#### Backend Optimization
- Monitor memory usage
- Check file processing time
- Optimize Claude API calls

## 📊 Scaling Considerations

### Traffic Growth
- Monitor request patterns
- Implement caching strategies
- Consider CDN for static assets

### Database Needs
If you need to store data:
- Railway: Built-in PostgreSQL
- Vercel: Consider PlanetScale or Supabase
- Render: PostgreSQL add-on available

### Advanced Features
- User authentication
- Usage analytics
- Custom card themes
- Collaborative features

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Vercel
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 💡 Best Practices

### Security
- Never commit API keys to Git
- Use environment variables for all secrets
- Enable HTTPS/SSL certificates
- Implement rate limiting
- Validate all user inputs

### Performance
- Optimize images and assets
- Enable gzip compression
- Use CDN for static files
- Implement caching headers
- Monitor and optimize API calls

### Monitoring
- Set up uptime monitoring
- Track error rates
- Monitor API usage
- Log important events
- Set up alerts for issues

---

Need help with deployment? Check the [main README](../README.md) or create an issue in the repository.