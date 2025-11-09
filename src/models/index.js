// src/models/index.js
const { Sequelize, DataTypes, Op } = require('sequelize');
require('dotenv').config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL이 .env에 없습니다.');
  process.exit(1);
}

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Product
const Product = sequelize.define(
  'Product',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: false },
    price: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 0 } },
    tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
  },
  { timestamps: true }
);

// Article
const Article = sequelize.define(
  'Article',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: false },
  },
  { timestamps: true }
);

// Comment
const Comment = sequelize.define(
  'Comment',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    // FK는 아래 association에서 생성
  },
  { timestamps: true }
);

// 관계(onDelete 설정)
Product.hasMany(Comment, { foreignKey: 'productId', onDelete: 'CASCADE' });
Comment.belongsTo(Product, { foreignKey: 'productId' });

Article.hasMany(Comment, { foreignKey: 'articleId', onDelete: 'CASCADE' });
Comment.belongsTo(Article, { foreignKey: 'articleId' });

module.exports = { sequelize, Product, Article, Comment, Op };
