// src/seed/seed.js
const { sequelize, Product, Article } = require('../models');
const { PRODUCTS, ARTICLES } = require('./data');

(async () => {
  try {
    console.log('🚀 시딩 시작...');
    await sequelize.authenticate();
    console.log('✅ DB 연결 성공');

    // 테이블 재생성
    await sequelize.sync({ force: true });

    // 데이터 입력
    if (PRODUCTS.length) await Product.bulkCreate(PRODUCTS);
    if (ARTICLES.length) await Article.bulkCreate(ARTICLES);

    console.log('🌱 시딩 완료!');
    process.exit(0);
  } catch (err) {
    console.error('❌ 시딩 실패:', err);
    process.exit(1);
  }
})();
