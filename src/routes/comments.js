// src/routes/comments.js
const express = require('express');
const router = express.Router();
const { Comment, Product, Article, Op } = require('../models');
const { validateComment } = require('../middleware/validate');

// 커서 토큰 (createdAt,id) 단순 base64
function encodeCursor(row) {
  return Buffer.from(JSON.stringify({ createdAt: row.createdAt, id: row.id })).toString('base64');
}
function decodeCursor(token) {
  try {
    return JSON.parse(Buffer.from(token, 'base64').toString());
  } catch {
    return null;
  }
}

// 상품 댓글 등록
router.post('/product/:productId', validateComment, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

    const created = await Comment.create({ content: req.body.content, productId: product.id });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// 게시글 댓글 등록
router.post('/article/:articleId', validateComment, async (req, res, next) => {
  try {
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    const created = await Comment.create({ content: req.body.content, articleId: article.id });
    return res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// 댓글 수정
router.patch('/:id', validateComment, async (req, res, next) => {
  try {
    const item = await Comment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    await item.update({ content: req.body.content });
    return res.status(200).json(item);
  } catch (err) {
    next(err);
  }
});

// 댓글 삭제
router.delete('/:id', async (req, res, next) => {
  try {
    const item = await Comment.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: '댓글을 찾을 수 없습니다.' });
    await item.destroy();
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// 상품 댓글 목록 (cursor 방식)
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { limit = 10, cursor } = req.query;
    const product = await Product.findByPk(req.params.productId);
    if (!product) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });

    let where = { productId: product.id };
    if (cursor) {
      const c = decodeCursor(cursor);
      if (c) {
        // 최신순
        where = {
          ...where,
          [Op.or]: [
            { createdAt: { [Op.lt]: c.createdAt } },
            { createdAt: c.createdAt, id: { [Op.lt]: c.id } },
          ],
        };
      }
    }

    const rows = await Comment.findAll({
      attributes: ['id', 'content', 'createdAt'],
      where,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: Number(limit) + 1,
    });

    let nextCursor = null;
    if (rows.length > Number(limit)) {
      const last = rows[Number(limit) - 1];
      nextCursor = encodeCursor(last);
      rows.splice(Number(limit)); // 초과분 제거
    }

    return res.status(200).json({ items: rows, nextCursor });
  } catch (err) {
    next(err);
  }
});

// 게시글 댓글 목록 (cursor 방식)
router.get('/article/:articleId', async (req, res, next) => {
  try {
    const { limit = 10, cursor } = req.query;
    const article = await Article.findByPk(req.params.articleId);
    if (!article) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });

    let where = { articleId: article.id };
    if (cursor) {
      const c = decodeCursor(cursor);
      if (c) {
        where = {
          ...where,
          [Op.or]: [
            { createdAt: { [Op.lt]: c.createdAt } },
            { createdAt: c.createdAt, id: { [Op.lt]: c.id } },
          ],
        };
      }
    }

    const rows = await Comment.findAll({
      attributes: ['id', 'content', 'createdAt'],
      where,
      order: [
        ['createdAt', 'DESC'],
        ['id', 'DESC'],
      ],
      limit: Number(limit) + 1,
    });

    let nextCursor = null;
    if (rows.length > Number(limit)) {
      const last = rows[Number(limit) - 1];
      nextCursor = encodeCursor(last);
      rows.splice(Number(limit));
    }

    return res.status(200).json({ items: rows, nextCursor });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
