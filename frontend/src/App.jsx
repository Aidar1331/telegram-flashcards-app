import React, { useState, useEffect, useCallback } from 'react';
import { Upload, FileText, RotateCcw, ChevronLeft, ChevronRight, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import './App.css';

const API_BASE_URL = import.meta.env.PROD ? '' : '';

function App() {
  const [state, setState] = useState('upload'); // 'upload', 'generating', 'cards'
  const [flashcards, setFlashcards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [telegramData, setTelegramData] = useState(null);

  // Initialize Telegram WebApp
  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      tg.ready();
      tg.expand();
      
      // Set theme colors
      if (tg.themeParams) {
        document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#000000');
        document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#999999');
        document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#2481cc');
        document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
        document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#f1f1f1');
      }
      
      // Get init data for validation
      if (tg.initData) {
        setTelegramData(tg.initData);
      }
      
      // Configure main button
      tg.MainButton.setText('Генерировать карточки');
      tg.MainButton.hide();
      
      // Configure back button
      tg.BackButton.onClick(() => {
        if (state === 'cards') {
          setState('upload');
          setFlashcards([]);
          setCurrentCardIndex(0);
          setIsFlipped(false);
          tg.BackButton.hide();
          tg.MainButton.show();
        }
      });
    }
  }, [state]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (state === 'cards') {
        switch (e.key) {
          case 'ArrowLeft':
            e.preventDefault();
            goToPrevCard();
            break;
          case 'ArrowRight':
            e.preventDefault();
            goToNextCard();
            break;
          case ' ':
            e.preventDefault();
            flipCard();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state, currentCardIndex, flashcards.length]);

  const goToPrevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const goToNextCard = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const flipCard = () => {
    setIsFlipped(!isFlipped);
  };

  const resetToUpload = () => {
    setState('upload');
    setFlashcards([]);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setError('');
    setText('');
    setProgress(0);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.BackButton.hide();
      window.Telegram.WebApp.MainButton.show();
    }
  };

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    const maxSize = 1024 * 1024; // 1MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Поддерживаются только файлы PDF, DOCX и TXT');
    }

    if (file.size > maxSize) {
      throw new Error('Размер файла не должен превышать 1 МБ');
    }
  };

  const handleFile = async (file) => {
    try {
      setError('');
      validateFile(file);
      await generateFlashcards(file, null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleTextSubmit = async () => {
    if (!text.trim()) {
      setError('Пожалуйста, введите текст');
      return;
    }

    if (text.length > 10000) {
      setError('Текст слишком длинный. Максимум 10,000 символов');
      return;
    }

    try {
      setError('');
      await generateFlashcards(null, text);
    } catch (err) {
      setError(err.message);
    }
  };

  const generateFlashcards = async (file, textInput) => {
    setState('generating');
    setProgress(0);
    
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.MainButton.hide();
    }

    try {
      const formData = new FormData();
      
      if (file) {
        formData.append('file', file);
      } else if (textInput) {
        formData.append('text', textInput);
      }
      
      // Add Telegram init data for validation
      if (telegramData) {
        formData.append('initData', telegramData);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetch(`${API_BASE_URL}/api/generate-flashcards`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка сервера: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.flashcards || data.flashcards.length === 0) {
        throw new Error('Не удалось создать карточки из предоставленного содержимого');
      }

      setFlashcards(data.flashcards);
      setState('cards');
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.BackButton.show();
      }

    } catch (err) {
      console.error('Generate flashcards error:', err);
      setError(err.message || 'Произошла ошибка при генерации карточек');
      setState('upload');
      
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.MainButton.show();
      }
    }
  };

  const renderUploadState = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-telegram-text">
          📚 Карточки для обучения
        </h1>
        <p className="text-lg text-telegram-hint">
          Загрузите файл или введите текст для создания обучающих карточек
        </p>
      </div>

      {error && (
        <div className="message error">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {/* File Upload */}
      <div 
        className={`upload-area ${dragActive ? 'dragover' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileChange}
          disabled={state === 'generating'}
        />
        <Upload size={48} className="mx-auto mb-4 text-telegram-hint" />
        <h3 className="text-xl font-semibold mb-2">Загрузить файл</h3>
        <p className="text-telegram-hint">
          Поддерживаются PDF, DOCX и TXT файлы до 1 МБ
        </p>
      </div>

      <div className="text-center text-telegram-hint font-medium">
        или
      </div>

      {/* Text Input */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <FileText size={24} />
          Введите текст
        </h3>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Вставьте или введите текст для создания карточек (до 10,000 символов)..."
          className="w-full h-40 p-4 border-2 border-telegram-hint rounded-lg resize-none focus:border-telegram-button focus:outline-none transition-colors"
          maxLength={10000}
          disabled={state === 'generating'}
        />
        <div className="flex justify-between items-center">
          <span className="text-sm text-telegram-hint">
            {text.length}/10,000 символов
          </span>
          <button
            onClick={handleTextSubmit}
            disabled={!text.trim() || state === 'generating'}
            className="btn btn-primary"
          >
            <FileText size={20} />
            Создать карточки
          </button>
        </div>
      </div>
    </div>
  );

  const renderGeneratingState = () => (
    <div className="max-w-lg mx-auto text-center space-y-6">
      <div className="space-y-4">
        <Loader2 size={64} className="mx-auto animate-spin text-telegram-button" />
        <h2 className="text-2xl font-bold text-telegram-text">
          Создаём карточки...
        </h2>
        <p className="text-telegram-hint">
          ИИ анализирует содержимое и создаёт обучающие карточки
        </p>
      </div>
      
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <p className="text-sm text-telegram-hint">
        {progress}% завершено
      </p>
    </div>
  );

  const renderCardsState = () => {
    const currentCard = flashcards[currentCardIndex];
    
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-telegram-text mb-2">
            Ваши карточки готовы!
          </h2>
          <p className="text-telegram-hint">
            Нажмите на карточку, чтобы перевернуть. Используйте стрелки для навигации.
          </p>
        </div>

        {/* Card Navigation */}
        <div className="card-navigation">
          <button
            className="nav-button"
            onClick={goToPrevCard}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft size={20} />
          </button>
          
          <div className="card-counter">
            {currentCardIndex + 1} / {flashcards.length}
          </div>
          
          <button
            className="nav-button"
            onClick={goToNextCard}
            disabled={currentCardIndex === flashcards.length - 1}
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 3D Card */}
        <div className="card-container">
          <div 
            className={`card ${isFlipped ? 'flipped' : ''}`}
            onClick={flipCard}
          >
            <div className="card-face card-front">
              <div className="card-content">
                {currentCard.front}
              </div>
            </div>
            <div className="card-face card-back">
              <div className="card-content">
                {currentCard.back}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={flipCard}
              className="btn btn-secondary"
            >
              <RotateCcw size={20} />
              Перевернуть
            </button>
          </div>
          
          <div className="text-center">
            <button
              onClick={resetToUpload}
              className="btn btn-primary"
            >
              Создать новые карточки
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="message info">
          <CheckCircle size={20} />
          Используйте клавиши ← → для навигации и пробел для переворота карточки
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-telegram-bg text-telegram-text p-4">
      <div className="fade-in">
        {state === 'upload' && renderUploadState()}
        {state === 'generating' && renderGeneratingState()}
        {state === 'cards' && renderCardsState()}
      </div>
    </div>
  );
}

export default App;
