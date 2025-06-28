# 🔌 API Documentation

Complete API reference for the Telegram Flashcards Mini App backend.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://your-deployment-url.com`

## Authentication

The API uses Telegram WebApp initData for authentication in production. For development, authentication is optional.

### Telegram InitData Validation

Production requests should include `initData` parameter containing the Telegram WebApp initialization data string.

```javascript
// Example of initData validation
const initData = window.Telegram.WebApp.initData;
formData.append('initData', initData);
```

## Endpoints

### 📋 Health Check

**GET** `/api/health`

Check if the API server is running and healthy.

#### Request
```bash
curl -X GET http://localhost:3001/api/health
```

#### Response
```json
{
  "status": "OK",
  "timestamp": "2023-12-07T10:30:00.000Z",
  "version": "1.0.0"
}
```

#### Status Codes
- `200`: Server is healthy
- `500`: Server error

---

### 🎴 Generate Flashcards

**POST** `/api/generate-flashcards`

Generate flashcards from uploaded file or text input using Claude AI.

#### Request Methods

##### File Upload
```bash
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "file=@document.pdf" \
  -F "initData=query_id%3DAAHdF6IQAAAAAN0XohDhrOrc%26user%3D..."
```

##### Text Input
```bash
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "text=Machine learning is a method of data analysis..." \
  -F "initData=query_id%3DAAHdF6IQAAAAAN0XohDhrOrc%26user%3D..."
```

#### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Conditional* | PDF, DOCX, or TXT file (max 1MB) |
| `text` | String | Conditional* | Text content (max 10,000 characters) |
| `initData` | String | Optional** | Telegram WebApp initialization data |

*Either `file` or `text` must be provided, but not both.
**Required in production environment.

#### File Constraints

| File Type | MIME Type | Max Size | Description |
|-----------|-----------|----------|-------------|
| PDF | `application/pdf` | 1MB | Text will be extracted from PDF |
| DOCX | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | 1MB | Text will be extracted from Word document |
| TXT | `text/plain` | 1MB | Plain text file |

#### Success Response

**Status**: `200 OK`

```json
{
  "success": true,
  "flashcards": [
    {
      "front": "What is machine learning?",
      "back": "A method of data analysis that automates analytical model building. It is a branch of artificial intelligence based on the idea that systems can learn from data, identify patterns, and make decisions with minimal human intervention."
    },
    {
      "front": "What are the main types of machine learning?",
      "back": "Supervised learning (with labeled data), unsupervised learning (finding patterns in unlabeled data), and reinforcement learning (learning through interaction with environment)."
    }
  ],
  "count": 8
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `success` | Boolean | Always `true` for successful requests |
| `flashcards` | Array | Array of flashcard objects |
| `flashcards[].front` | String | Question or term (1-8 words) |
| `flashcards[].back` | String | Answer or definition (up to 100 words) |
| `count` | Number | Total number of flashcards generated |

#### Error Responses

##### 400 Bad Request - No Content
```json
{
  "error": "No file or text provided"
}
```

##### 400 Bad Request - Invalid File Type
```json
{
  "error": "Only PDF, DOCX, and TXT files are allowed"
}
```

##### 400 Bad Request - File Too Large
```json
{
  "error": "File size too large. Maximum size is 1MB."
}
```

##### 400 Bad Request - Text Too Long
```json
{
  "error": "Content too long. Please provide shorter text or file."
}
```

##### 400 Bad Request - Empty Content
```json
{
  "error": "No content found in file or text"
}
```

##### 401 Unauthorized - Invalid Telegram Data
```json
{
  "error": "Invalid Telegram data"
}
```

##### 503 Service Unavailable - AI Service Error
```json
{
  "error": "AI service temporarily unavailable. Please try again later."
}
```

##### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **Limit**: 100 requests per IP per 15 minutes
- **Headers**: Rate limit headers are included in responses
- **Exceeded**: Returns `429 Too Many Requests`

```bash
# Rate limit headers in response
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1701936600
```

## CORS Policy

Cross-Origin Resource Sharing (CORS) is configured for:

**Development**:
- `http://localhost:5173` (Vite dev server)
- `https://web.telegram.org` (Telegram WebApp)

**Production**:
- Your deployment domain
- `https://web.telegram.org`

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message"
}
```

### Error Categories

| Category | HTTP Status | Description |
|----------|-------------|-------------|
| Validation | 400 | Invalid input parameters |
| Authentication | 401 | Invalid or missing Telegram data |
| Not Found | 404 | Endpoint not found |
| Rate Limiting | 429 | Too many requests |
| Server Error | 500 | Internal server error |
| Service Unavailable | 503 | External service (Claude API) error |

## Request Examples

### JavaScript (Frontend)

```javascript
// File upload example
const fileInput = document.querySelector('input[type="file"]');
const file = fileInput.files[0];

const formData = new FormData();
formData.append('file', file);

// Add Telegram data for validation
if (window.Telegram?.WebApp?.initData) {
  formData.append('initData', window.Telegram.WebApp.initData);
}

try {
  const response = await fetch('/api/generate-flashcards', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const data = await response.json();
  console.log(`Generated ${data.count} flashcards:`, data.flashcards);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Node.js (Backend)

```javascript
const FormData = require('form-data');
const fs = require('fs');

const form = new FormData();
form.append('file', fs.createReadStream('document.pdf'));

const response = await fetch('http://localhost:3001/api/generate-flashcards', {
  method: 'POST',
  body: form,
});

const data = await response.json();
```

### Python

```python
import requests

# File upload
files = {'file': open('document.pdf', 'rb')}
response = requests.post(
    'http://localhost:3001/api/generate-flashcards',
    files=files
)

# Text input
data = {'text': 'Machine learning is...'}
response = requests.post(
    'http://localhost:3001/api/generate-flashcards',
    data=data
)

flashcards = response.json()
```

## Claude AI Integration

The API uses Claude 3 Sonnet model with a specialized prompt for educational content:

### Prompt Template
```
Ты - эксперт по созданию обучающих карточек. Создай из текста карточки для эффективного изучения.

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

НЕ включай никакого дополнительного текста, только JSON массив.
```

### Claude API Configuration
- **Model**: `claude-3-sonnet-20240229`
- **Max Tokens**: 2000
- **Temperature**: Default (balanced creativity)

## Security

### Input Validation
- File type validation using MIME types
- File size limits (1MB maximum)
- Text length limits (10,000 characters)
- Malicious file content scanning

### Telegram Validation
```javascript
function validateTelegramData(initData, botToken) {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');
  
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
  
  return calculatedHash === hash;
}
```

### Data Protection
- Files are processed in memory and immediately deleted
- No user data is stored permanently
- API keys are secured with environment variables
- HTTPS enforcement in production

## Performance

### Response Times
- Health check: < 10ms
- Text processing: 2-5 seconds (depending on length)
- File processing: 3-8 seconds (depending on file size and type)

### Optimizations
- File streaming for large uploads
- Efficient text parsing algorithms
- Connection pooling for external APIs
- Graceful error handling and timeouts

## Monitoring

### Logging
All requests are logged with:
- Timestamp
- IP address
- Request method and path
- Response status
- Processing time
- Error details (if any)

### Health Monitoring
Regular health checks should be performed on:
- `/api/health` endpoint
- Claude API connectivity
- File processing capabilities

## Development

### Local Testing
```bash
# Start development server
npm run dev:backend

# Test health endpoint
curl http://localhost:3001/api/health

# Test with sample text
curl -X POST http://localhost:3001/api/generate-flashcards \
  -F "text=Sample educational content for testing"
```

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

---

For additional support or questions about the API, please refer to the main [README](../README.md) or create an issue in the repository.