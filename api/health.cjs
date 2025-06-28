module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.json({
    status: 'OK',
    timestamp: Date.now(),
    version: '1.0.0',
    claudeApi: process.env.CLAUDE_API_KEY ? 'configured' : 'missing',
    telegramBot: process.env.TELEGRAM_BOT_TOKEN ? 'configured' : 'missing'
  });
};