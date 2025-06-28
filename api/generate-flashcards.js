module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mockFlashcards = [
      {
        "front": "Что такое React?",
        "back": "JavaScript библиотека для создания пользовательских интерфейсов"
      },
      {
        "front": "Что такое useState?", 
        "back": "React Hook для управления состоянием компонента"
      },
      {
        "front": "Что такое useEffect?",
        "back": "React Hook для выполнения побочных эффектов в функциональных компонентах"
      }
    ];

    res.status(200).json({ 
      success: true, 
      flashcards: mockFlashcards,
      count: mockFlashcards.length,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Generate flashcards error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      message: error.message 
    });
  }
};