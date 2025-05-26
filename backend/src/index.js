require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.json());

// 1) Подключаемся к MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// 2) Отдаём статичные файлы фронтенда
app.use(express.static(path.join(__dirname, '../public')));

// 3) Тестовый корневой роут
app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

// Public API
app.use('/api/ping', (req, res) => res.json({ pong: true }));
app.use('/api/components', require('./routes/components'));

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Protected config routes
app.use('/api/configs', require('./routes/configs'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});
