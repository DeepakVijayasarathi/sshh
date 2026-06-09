const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = (folder) =>
  multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, '..', 'uploads', folder);
      ensureDir(dir);
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${unique}${path.extname(file.originalname)}`);
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const documentFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx|jpeg|jpg|png/;
  if (allowed.test(path.extname(file.originalname).toLowerCase())) return cb(null, true);
  cb(new Error('Only PDF, DOC, DOCX and image files are allowed'));
};

const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024;

module.exports = {
  uploadImage: (folder) =>
    multer({ storage: storage(folder), fileFilter: imageFilter, limits: { fileSize: MAX_SIZE } }),
  uploadDocument: (folder) =>
    multer({ storage: storage(folder), fileFilter: documentFilter, limits: { fileSize: MAX_SIZE } }),
  uploadAny: (folder) =>
    multer({ storage: storage(folder), limits: { fileSize: MAX_SIZE } }),
};
