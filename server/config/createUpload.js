const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ensureDirExists = require('../utils/ensureDir');

const MIME_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const EXT_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function createUpload(folderName) {
  if (!folderName) {
    throw new Error('folderName é obrigatório no createUpload');
  }

  const uploadDir = path.resolve(
    __dirname,
    '..',
    'uploads',
    folderName
  );

  ensureDirExists(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // nome gerado do zero (não usa file.originalname) — evita path traversal
      // e caracteres inválidos vindos do arquivo enviado pelo cliente
      const ext = path.extname(file.originalname).toLowerCase();
      const extSegura = EXT_PERMITIDAS.includes(ext) ? ext : '';
      cb(null, `${Date.now()}-${crypto.randomUUID()}${extSegura}`);
    }
  });

  return multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      cb(null, MIME_PERMITIDOS.includes(file.mimetype));
    }
  });
}

module.exports = createUpload;
