module.exports = (req, res) => {
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const mockFlashcards = [
    {
      "front": "Тестовый вопрос 1",
      "back": "Тестовый ответ 1"
    },
    {
      "front": "Тестовый вопрос 2", 
      "back": "Тестовый ответ 2"
    },
    {
      "front": "Тестовый вопрос 3",
      "back": "Тестовый ответ 3"
    }
  ];

  res.status(200).json({ 
    success: true, 
    flashcards: mockFlashcards,
    count: mockFlashcards.length
  });
};