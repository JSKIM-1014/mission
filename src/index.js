require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const products = require('./routes/products');
const articles = require('./routes/articles');
const comments = require('./routes/comments');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', products);
app.use('/api/articles', articles);
app.use('/api/comments', comments);

const PORT = process.env.PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => console.log(`🚀 서버 실행 중: http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ DB 연결 실패:', err);
  }
})();
