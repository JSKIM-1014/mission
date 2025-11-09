// src/routes/articles.js
const express = require('express');
const router = express.Router();
const { Article, Op } = require('../models');
const { validateArticle } = require('../middleware/validate');

// /api/articles (등록 + 목록)
router
  .route('/')
  // 등록
  .post(validateArticle, async (req, res, next) => {
    try {
      const { title, content } = req.body;
      const created = await Article.create({ title, content });
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  })
  // 목록 (offset + 검색 + 최신순)
  .get(async (req, res, next) => {
    try {
      const { offset = 0, limit = 10, search = '', sort = 'recent' } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { content: { [Op.iLike]: `%${search}%` } },
        ];
      }
      const order = sort === 'recent' ? [['createdAt', 'DESC']] : [['id', 'ASC']];

      const rows = await Article.findAll({
        attributes: ['id', 'title', 'content', 'createdAt'],
        where,
        order,
        offset: Number(offset),
        limit: Number(limit),
      });
      return res.status(200).json(rows);
    } catch (err) {
      next(err);
    }
  });

// 상세/수정/삭제
router
  .route('/:id')
  .get(async (req, res, next) => {
    try {
      const item = await Article.findByPk(req.params.id, {
        attributes: ['id', 'title', 'content', 'createdAt'],
      });
      if (!item) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      return res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  })
  .patch(async (req, res, next) => {
    try {
      const item = await Article.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      await item.update(req.body);
      return res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  })
  .delete(async (req, res, next) => {
    try {
      const item = await Article.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
      await item.destroy();
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
