// src/middleware/validate.js
function validateProduct(req, res, next) {
  const { name, description, price } = req.body;
  if (!name || !description || price === undefined) {
    return res.status(400).json({ message: 'name, description, price는 필수입니다.' });
  }
  if (typeof price !== 'number' || price < 0) {
    return res.status(400).json({ message: 'price는 0 이상의 숫자여야 합니다.' });
  }
  next();
}

function validateArticle(req, res, next) {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'title, content는 필수입니다.' });
  }
  next();
}

function validateComment(req, res, next) {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'content는 필수입니다.' });
  next();
}

module.exports = { validateProduct, validateArticle, validateComment };
