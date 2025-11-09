// src/middleware/errorHandler.js
function notFoundHandler(req, res, next) {
  res.status(404).json({ message: '리소스를 찾을 수 없습니다.' });
}

function errorHandler(err, req, res, next) {
  console.error(err);
  // 이미 헤더 전송되었으면 Express 기본 처리
  if (res.headersSent) return next(err);

  const status = err.status || 500;
  const msg =
    status >= 500 ? '서버 오류가 발생했습니다.' : err.message || '요청 처리 중 오류';
  res.status(status).json({ message: msg });
}

module.exports = { notFoundHandler, errorHandler };
