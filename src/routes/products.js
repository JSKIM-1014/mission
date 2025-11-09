// src/routes/products.js
const express = require('express');
const router = express.Router();
const { Product, Op } = require('../models');
const { validateProduct } = require('../middleware/validate');

// /api/products (등록 + 목록)
router
  .route('/')
  // 상품 등록
  .post(validateProduct, async (req, res, next) => {
    try {
      const { name, description, price, tags = [] } = req.body;
      const created = await Product.create({ name, description, price, tags });
      return res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  })
  // 상품 목록 (offset 페이지네이션 + 검색 + 최신순)
  .get(async (req, res, next) => {
    try {
      const { offset = 0, limit = 10, search = '', sort = 'recent' } = req.query;

      const where = {};
      if (search) {
        where[Op.or] = [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const order = sort === 'recent' ? [['createdAt', 'DESC']] : [['id', 'ASC']];

      const rows = await Product.findAll({
        attributes: ['id', 'name', 'price', 'createdAt'],
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

// 개별 상품
router
  .route('/:id')
  // 상세
  .get(async (req, res, next) => {
    try {
      const item = await Product.findByPk(req.params.id, {
        attributes: ['id', 'name', 'description', 'price', 'tags', 'createdAt'],
      });
      if (!item) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      return res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  })
  // 수정 (PATCH)
  .patch(async (req, res, next) => {
    try {
      const item = await Product.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      await item.update(req.body);
      return res.status(200).json(item);
    } catch (err) {
      next(err);
    }
  })
  // 삭제
  .delete(async (req, res, next) => {
    try {
      const item = await Product.findByPk(req.params.id);
      if (!item) return res.status(404).json({ message: '상품을 찾을 수 없습니다.' });
      await item.destroy();
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  });

module.exports = router;
