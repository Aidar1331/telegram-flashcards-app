# 🚀 Инструкции по развертыванию

## Шаги для получения Production URL:

### 1. Войдите в систему Vercel
```bash
vercel login
```
Выберите ваш метод входа (GitHub рекомендуется)

### 2. Установите переменные окружения
```bash
vercel env add CLAUDE_API_KEY production
```
Введите ваш ключ Claude API

```bash
vercel env add TELEGRAM_BOT_TOKEN production  
```
Введите ваш Telegram Bot Token

```bash
vercel env add NODE_ENV production
```
Введите: production

### 3. Разверните проект
```bash
vercel --prod
```

### 4. Получите URL
После успешного развертывания вы получите URL вида:
`https://flashcards-xyz123.vercel.app`

Этот URL и нужно указать в @BotFather!

## Альтернативный способ - через веб-интерфейс:

1. Перейдите на vercel.com
2. Подключите ваш GitHub репозиторий
3. Установите переменные окружения в настройках
4. Автоматическое развертывание начнется