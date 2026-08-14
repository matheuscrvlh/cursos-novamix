const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');

const uploadBanners = createUpload('banners');
const router = express.Router();

router.get('/', async (req, res) => {
  const { posicao } = req.query;
  const sql    = posicao
    ? `SELECT * FROM banners WHERE posicao = $1 ORDER BY ordem ASC`
    : `SELECT * FROM banners ORDER BY posicao, ordem ASC`;
  const params = posicao ? [posicao] : [];

  try {
    const { rows } = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const uploadFields = uploadBanners.fields([
  { name: 'imagem',        maxCount: 1 },
  { name: 'imagem_mobile', maxCount: 1 },
]);

router.post('/', authenticate, requireCursosAccess, uploadFields, async (req, res) => {
  const { posicao, link, ordem } = req.body;
  const imagemFile       = req.files?.['imagem']?.[0];
  const imagemMobileFile = req.files?.['imagem_mobile']?.[0];

  if (!imagemFile) return res.status(400).json({ error: 'Imagem obrigatória' });
  if (!posicao)    return res.status(400).json({ error: 'posicao obrigatória (hero | home)' });

  const id           = uuidv4();
  const imagem       = `/uploads/banners/${imagemFile.filename}`;
  const imagemMobile = imagemMobileFile ? `/uploads/banners/${imagemMobileFile.filename}` : null;

  try {
    await pool.query(
      `INSERT INTO banners (id, posicao, imagem, imagem_mobile, link, ordem, ativo) VALUES ($1, $2, $3, $4, $5, $6, 1)`,
      [id, posicao, imagem, imagemMobile, link || null, Number(ordem) || 0]
    );
    res.status(201).json({ id, posicao, imagem, imagem_mobile: imagemMobile, link: link || null, ordem: Number(ordem) || 0, ativo: 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireCursosAccess, async (req, res) => {
  const { link, ordem, ativo } = req.body;

  try {
    const result = await pool.query(
      `UPDATE banners
       SET link  = COALESCE($1, link),
           ordem = COALESCE($2, ordem),
           ativo = COALESCE($3, ativo)
       WHERE id = $4`,
      [
        link  !== undefined ? link  : null,
        ordem !== undefined ? Number(ordem) : null,
        ativo !== undefined ? Number(ativo) : null,
        req.params.id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Banner não encontrado' });
    res.json({ message: 'Atualizado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT imagem, imagem_mobile FROM banners WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Banner não encontrado' });
    const row = rows[0];

    fs.unlink(path.join(__dirname, '..', row.imagem), () => {});
    if (row.imagem_mobile) fs.unlink(path.join(__dirname, '..', row.imagem_mobile), () => {});

    await pool.query(`DELETE FROM banners WHERE id = $1`, [req.params.id]);
    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
