// src/routes/uploads.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const absUploadDir = path.join(__dirname, '..', '..', UPLOAD_DIR);

// 디렉토리 없으면 생성
if (!fs.existsSync(absUploadDir)) fs.mkdirSync(absUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, absUploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// 단일 파일 업로드: form-data key = "image"
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '이미지 파일이 필요합니다.' });
  // 정적 제공 경로(/uploads)는 index.js에서 설정
  const publicPath = `/uploads/${req.file.filename}`;
  return res.status(201).json({ path: publicPath, filename: req.file.filename });
});

module.exports = router;
