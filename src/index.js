// src/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize } = require('./models');

const productsRouter = require('./routes/products');
const articlesRouter = require('./routes/articles');
const commentsRouter = require('./routes/comments');
const uploadsRouter = require('./routes/uploads');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 업로드 정적 경로
app.use(
  '/uploads',
  express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads'))
);

// 라우트(app.route 중복 경로 통합 예시: /api/health)
app
  .route('/api/health')
  .get((req, res) => res.status(200).json({ ok: true, time: new Date().toISOString() }));

app.use('/api/products', productsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/comments', commentsRouter);
app.use('/api/uploads', uploadsRouter);

// 404
app.use(notFoundHandler);
// 에러 핸들러
app.use(errorHandler);

// 서버 시작
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Unable to connect to DB:', err);
    process.exit(1);
  }
})();
