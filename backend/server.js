const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// File parsers
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

// Claude API
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-vercel-app.vercel.app', 'https://web.telegram.org']
    : ['http://localhost:5173', 'https://web.telegram.org'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'text/plain';
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and TXT files are allowed'));
    }
  }
});

// Telegram data validation function
function validateTelegramData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) return false;
    
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Telegram validation error:', error);
    return false;
  }
}

// File parsing functions
async function parseFile(filePath, fileType) {
  try {
    switch (fileType) {
      case 'pdf':
        const pdfBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(pdfBuffer);
        return pdfData.text;
        
      case 'docx':
        const docxResult = await mammoth.extractRawText({ path: filePath });
        return docxResult.value;
        
      case 'txt':
        return fs.readFileSync(filePath, 'utf8');
        
      default:
        throw new Error('Unsupported file type');
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error('Failed to parse file');
  }
}

// Generate flashcards using Claude API
async function generateFlashcards(text) {
  try {
    const prompt = `Ты - эксперт по созданию обучающих карточек. Создай из текста карточки для эффективного изучения.

ТЕКСТ: ${text}

ТРЕБОВАНИЯ:
1. Извлеки 5-15 ключевых понятий/терминов/фактов
2. Каждая карточка: front (вопрос/термин), back (ответ/определение)  
3. Front: краткий вопрос или термин (1-8 слов)
4. Back: четкий ответ или определение (до 100 слов)
5. Фокус на самых важных аспектах материала
6. Отвечай на русском языке

ФОРМАТ ОТВЕТА - только JSON массив:
[{"front": "Вопрос или термин", "back": "Четкий ответ или определение"}]

НЕ включай никакого дополнительного текста, только JSON массив.`;

    const message = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const response = message.content[0].text;
    
    // Try to extract JSON from the response
    let jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in Claude response');
    }
    
    const flashcards = JSON.parse(jsonMatch[0]);
    
    // Validate flashcards format
    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      throw new Error('Invalid flashcards format');
    }
    
    // Validate each flashcard
    flashcards.forEach((card, index) => {
      if (!card.front || !card.back) {
        throw new Error(`Invalid flashcard at index ${index}`);
      }
    });
    
    return flashcards;
    
  } catch (error) {
    console.error('Claude API error:', error);
    throw new Error('Failed to generate flashcards');
  }
}

// Clean up uploaded files
function cleanupFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('File cleanup error:', error);
  }
}

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Generate flashcards endpoint
app.post('/api/generate-flashcards', upload.single('file'), async (req, res) => {
  let filePath = null;
  
  try {
    const { text, initData } = req.body;
    
    // Validate Telegram data (optional in development)
    if (process.env.NODE_ENV === 'production' && initData) {
      const isValid = validateTelegramData(initData, process.env.TELEGRAM_BOT_TOKEN);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid Telegram data' });
      }
    }
    
    let content = '';
    
    // Handle file upload
    if (req.file) {
      filePath = req.file.path;
      const fileType = path.extname(req.file.originalname).toLowerCase().slice(1);
      content = await parseFile(filePath, fileType);
    } 
    // Handle text input
    else if (text) {
      content = text;
    } else {
      return res.status(400).json({ error: 'No file or text provided' });
    }
    
    // Validate content length
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'No content found in file or text' });
    }
    
    if (content.length > 50000) {
      return res.status(400).json({ error: 'Content too long. Please provide shorter text or file.' });
    }
    
    // Generate flashcards
    const flashcards = await generateFlashcards(content);
    
    res.json({ 
      success: true, 
      flashcards,
      count: flashcards.length 
    });
    
  } catch (error) {
    console.error('Generate flashcards error:', error);
    
    let errorMessage = 'Failed to generate flashcards';
    let statusCode = 500;
    
    if (error.message.includes('file type')) {
      errorMessage = 'Unsupported file type. Please use PDF, DOCX, or TXT files.';
      statusCode = 400;
    } else if (error.message.includes('file size')) {
      errorMessage = 'File size too large. Maximum size is 1MB.';
      statusCode = 400;
    } else if (error.message.includes('Claude API')) {
      errorMessage = 'AI service temporarily unavailable. Please try again later.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ error: errorMessage });
    
  } finally {
    // Clean up uploaded file
    if (filePath) {
      cleanupFile(filePath);
    }
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large. Maximum size is 1MB.' });
    }
  }
  
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;