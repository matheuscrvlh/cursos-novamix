const multer = require('multer');
const path = require('path');   
const uuidv4 = require('uuid').v4;

const storege = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, uuidv4() + ext);
    }
});

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];
    if (tiposPermitidos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Tipo de arquivo não permitido'));
    }
};

module.exports = multer({
    storage: storege,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // limite 2mb
});