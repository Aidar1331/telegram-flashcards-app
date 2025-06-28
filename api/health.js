export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    res.status(200).json({
      status: 'OK',
      timestamp: Date.now(),
      version: '1.0.1',
      claudeApi: process.env.CLAUDE_API_KEY ? 'configured' : 'missing',
      telegramBot: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}