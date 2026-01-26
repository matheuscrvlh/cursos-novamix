const multer = require('multer');
const path = require('path');
const ensureDirExists = require('../utils/ensureDir');

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

  // garantir que a pasta exista 
  ensureDirExists(uploadDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    }
  });

  return multer({ storage });
}

module.exports = createUpload;
