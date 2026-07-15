const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

const uploadBanners = createUpload('banners');
const router = express.Router();

db.run(`
  CREATE TABLE IF NOT EXISTS banners (
    id            TEXT    PRIMARY KEY,
    posicao       TEXT    NOT NULL,
    imagem        TEXT    NOT NULL,
    imagem_mobile TEXT,
    link          TEXT,
    ordem         INTEGER DEFAULT 0,
    ativo         INTEGER DEFAULT 1
  )
`);

// migração segura: adiciona coluna se ainda não existir
db.run(`ALTER TABLE banners ADD COLUMN imagem_mobile TEXT`, () => {});

router.get('/', (req, res) => {
  const { posicao } = req.query;
  const sql    = posicao
    ? `SELECT * FROM banners WHERE posicao = ? ORDER BY ordem ASC`
    : `SELECT * FROM banners ORDER BY posicao, ordem ASC`;
  const params = posicao ? [posicao] : [];
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

const uploadFields = uploadBanners.fields([
  { name: 'imagem',        maxCount: 1 },
  { name: 'imagem_mobile', maxCount: 1 },
]);

router.post('/', authMiddleware, uploadFields, (req, res) => {
  const { posicao, link, ordem } = req.body;
  const imagemFile       = req.files?.['imagem']?.[0];
  const imagemMobileFile = req.files?.['imagem_mobile']?.[0];

  if (!imagemFile) return res.status(400).json({ error: 'Imagem obrigatória' });
  if (!posicao)    return res.status(400).json({ error: 'posicao obrigatória (hero | home)' });

  const id           = uuidv4();
  const imagem       = `/uploads/banners/${imagemFile.filename}`;
  const imagemMobile = imagemMobileFile ? `/uploads/banners/${imagemMobileFile.filename}` : null;

  db.run(
    `INSERT INTO banners (id, posicao, imagem, imagem_mobile, link, ordem, ativo) VALUES (?, ?, ?, ?, ?, ?, 1)`,
    [id, posicao, imagem, imagemMobile, link || null, Number(ordem) || 0],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, posicao, imagem, imagem_mobile: imagemMobile, link: link || null, ordem: Number(ordem) || 0, ativo: 1 });
    }
  );
});

router.put('/:id', authMiddleware, (req, res) => {
  const { link, ordem, ativo } = req.body;
  db.run(
    `UPDATE banners
     SET link  = COALESCE(?, link),
         ordem = COALESCE(?, ordem),
         ativo = COALESCE(?, ativo)
     WHERE id = ?`,
    [
      link  !== undefined ? link  : null,
      ordem !== undefined ? Number(ordem) : null,
      ativo !== undefined ? Number(ativo) : null,
      req.params.id,
    ],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Atualizado' });
    }
  );
});

router.delete('/:id', authMiddleware, (req, res) => {
  db.get(`SELECT imagem, imagem_mobile FROM banners WHERE id = ?`, [req.params.id], (err, row) => {
    if (err)  return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Banner não encontrado' });

    fs.unlink(path.join(__dirname, '..', row.imagem), () => {});
    if (row.imagem_mobile) fs.unlink(path.join(__dirname, '..', row.imagem_mobile), () => {});

    db.run(`DELETE FROM banners WHERE id = ?`, [req.params.id], function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.sendStatus(204);
    });
  });
});

module.exports = router;
