// Vercel serverless function for generating flashcards
import crypto from 'crypto';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Disable default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new IncomingForm({
      maxFileSize: 1024 * 1024, // 1MB
      keepExtensions: true,
    });

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve([fields, files]);
      });
    });

    // Get text or file
    const text = fields.text?.[0];
    const file = files.file?.[0];
    const initData = fields.initData?.[0];

    // Validate Telegram data (optional in development)
    if (process.env.NODE_ENV === 'production' && initData) {
      const isValid = validateTelegramData(initData, process.env.TELEGRAM_BOT_TOKEN);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid Telegram data' });
      }
    }

    let content = '';

    // Handle file upload
    if (file) {
      const fileType = file.originalFilename.split('.').pop().toLowerCase();
      
      if (!['pdf', 'docx', 'txt'].includes(fileType)) {
        return res.status(400).json({ error: 'Only PDF, DOCX, and TXT files are allowed' });
      }

      content = await parseFile(file.filepath, fileType);
      
      // Clean up file
      try {
        fs.unlinkSync(file.filepath);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
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
    } else if (error.message.includes('Claude API') || error.message.includes('authentication_error')) {
      errorMessage = 'AI service temporarily unavailable. Please try again later.';
      statusCode = 503;
    }
    
    res.status(statusCode).json({ error: errorMessage });
  }
}