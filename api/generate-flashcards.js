module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const mockFlashcards = [
    {
      "front": "Что такое обучение?",
      "back": "Процесс приобретения знаний, навыков и компетенций."
    },
    {
      "front": "Флэш-карточки", 
      "back": "Инструмент для обучения с активным воспроизведением."
    },
    {
      "front": "Telegram Bot",
      "back": "Автоматизированная программа в Telegram."
    }
  ];

  res.json({ 
    success: true, 
    flashcards: mockFlashcards,
    count: mockFlashcards.length,
    claudeApiKey: process.env.CLAUDE_API_KEY ? 'Токен установлен' : 'Токен отсутствует'
  });
};