module.exports = async (req, res) => {
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
    // For now, return mock data to test the deployment
    const mockFlashcards = [
      {
        "front": "Что такое обучение?",
        "back": "Процесс приобретения знаний, навыков и компетенций через изучение, практику или преподавание."
      },
      {
        "front": "Флэш-карточки",
        "back": "Инструмент для обучения, использующий активное воспроизведение информации для улучшения запоминания."
      },
      {
        "front": "Искусственный интеллект",
        "back": "Технология, позволяющая машинам выполнять задачи, которые обычно требуют человеческого интеллекта."
      },
      {
        "front": "Telegram Bot",
        "back": "Автоматизированная программа, которая работает в мессенджере Telegram и может взаимодействовать с пользователями."
      },
      {
        "front": "Mini App",
        "back": "Легковесное приложение, которое работает внутри другого приложения без необходимости отдельной установки."
      }
    ];

    res.json({ 
      success: true, 
      flashcards: mockFlashcards,
      count: mockFlashcards.length,
      note: "Using mock data - API working correctly"
    });

  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
};