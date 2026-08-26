const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');
const logAudit = require('../utils/logAudit');

const uploadIndustria = createUpload('industrias');
const router = express.Router();

const SELECT_INDUSTRIA = `
  SELECT
    id, razao_social AS "razaoSocial", nome, cnpj, telefone, email,
    endereco, instagram, site, foto, criado_em AS "dataCadastro"
  FROM industrias
`;

// lista é pequena (uma linha por indústria cadastrada) e o front busca uma
// vez só e cacheia — busca por nome existe aqui pra ficar no mesmo padrão dos
// outros GETs que filtram no SQL, não porque o dataset precise disso hoje
router.get('/', async (req, res) => {
  try {
    const { busca } = req.query;
    const where = busca ? `WHERE nome ILIKE $1` : '';
    const { rows } = await pool.query(`${SELECT_INDUSTRIA} ${where}`, busca ? [`%${busca}%`] : []);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`${SELECT_INDUSTRIA} WHERE id = $1`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'Indústria não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireCursosAccess, uploadIndustria.single('foto'), async (req, res) => {
  const { razaoSocial, nome, cnpj, telefone, email, endereco, instagram, site } = req.body;
  const id = uuidv4();
  const foto = req.file ? `/uploads/industrias/${req.file.filename}` : null;

  if (!nome) {
    return res.status(400).json({ message: 'Nome é obrigatório' });
  }

  try {
    await pool.query(`
      INSERT INTO industrias
        (id, razao_social, nome, cnpj, telefone, email, endereco, instagram, site, foto)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id,
      razaoSocial,
      nome,
      cnpj      || '',
      telefone  || '',
      email     || '',
      endereco  || '',
      instagram || '',
      site      || '',
      foto,
    ]);

    res.status(201).json({ id, razaoSocial, nome, cnpj, telefone, email, endereco, instagram, site, foto });
  } catch (err) {
    console.error('Erro ao inserir indústria:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireCursosAccess, uploadIndustria.single('foto'), async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM industrias WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Indústria não encontrada' });
    const industria = rows[0];

    if (req.file && industria.foto) {
      const oldPath = path.join(__dirname, '..', industria.foto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const novaFoto = req.file
      ? `/uploads/industrias/${req.file.filename}`
      : industria.foto;

    await pool.query(`
      UPDATE industrias SET
        razao_social = COALESCE($1, razao_social),
        nome          = COALESCE($2, nome),
        cnpj          = COALESCE($3, cnpj),
        telefone      = COALESCE($4, telefone),
        email         = COALESCE($5, email),
        endereco      = COALESCE($6, endereco),
        instagram     = COALESCE($7, instagram),
        site          = COALESCE($8, site),
        foto          = $9
      WHERE id = $10
    `, [
      req.body.razaoSocial ?? null,
      req.body.nome        ?? null,
      req.body.cnpj        ?? null,
      req.body.telefone    ?? null,
      req.body.email       ?? null,
      req.body.endereco    ?? null,
      req.body.instagram   ?? null,
      req.body.site        ?? null,
      novaFoto,
      id
    ]);

    res.json({ message: 'Atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar indústria:', err);
    res.status(500).json({ message: 'Erro ao atualizar indústria' });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM industrias WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Indústria não encontrada' });
    const industria = rows[0];

    if (industria.foto) {
      const imgPath = path.join(__dirname, '..', industria.foto);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await pool.query(`DELETE FROM industrias WHERE id = $1`, [id]);

    logAudit({ entityType: 'industria', entityId: id, action: 'excluir', details: industria.nome, userHubId: req.user?.sub });

    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao deletar indústria:', err);
    res.status(500).json({ message: 'Erro ao excluir indústria' });
  }
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
