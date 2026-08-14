const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');

const uploadCulinaristas = createUpload('culinaristas');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM culinaristas`);

    const culinaristas = rows.map(c => ({
      ...c,
      lojas: c.lojas ? JSON.parse(c.lojas) : [],
      cursos: c.cursos ? JSON.parse(c.cursos) : []
    }));

    res.json(culinaristas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireCursosAccess, uploadCulinaristas.single('foto'), async (req, res) => {
  const { nomeCulinarista, cpf, lojas, cursos, instagram, industria, telefone } = req.body;

  if (!nomeCulinarista || !cpf) {
    return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
  }

  const id = uuidv4();
  const foto = req.file ? `/uploads/culinaristas/${req.file.filename}` : null;
  const dataCadastro = new Date().toISOString();

  try {
    await pool.query(`
      INSERT INTO culinaristas
        (id, "nomeCulinarista", cpf, industria, telefone, instagram, lojas, cursos, foto, "dataCadastro")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `, [
      id,
      nomeCulinarista,
      cpf,
      industria,
      telefone,
      instagram,
      lojas ? lojas : JSON.stringify([]),
      cursos ? cursos : JSON.stringify([]),
      foto,
      dataCadastro
    ]);

    res.status(201).json({ id, nomeCulinarista, cpf, industria, telefone, lojas, instagram, foto, dataCadastro });
  } catch (err) {
    console.error('Erro ao inserir culinarista:', err);
    res.status(500).json({ message: 'Erro ao criar culinarista' });
  }
});

router.put('/:id', authenticate, requireCursosAccess, uploadCulinaristas.single('foto'), async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM culinaristas WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Culinarista não encontrado' });
    const culinarista = rows[0];

    if (req.file && culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    const novaFoto = req.file
      ? `/uploads/culinaristas/${req.file.filename}`
      : culinarista.foto;

    await pool.query(`
      UPDATE culinaristas SET
        "nomeCulinarista" = COALESCE($1, "nomeCulinarista"),
        cpf               = COALESCE($2, cpf),
        instagram         = COALESCE($3, instagram),
        telefone          = COALESCE($4, telefone),
        industria         = COALESCE($5, industria),
        lojas             = COALESCE($6, lojas),
        cursos            = COALESCE($7, cursos),
        foto              = $8
      WHERE id = $9
    `, [
      req.body.nomeCulinarista ?? null,
      req.body.cpf ?? null,
      req.body.instagram ?? null,
      req.body.telefone ?? null,
      req.body.industria ?? null,
      req.body.lojas ?? null,
      req.body.cursos ?? null,
      novaFoto,
      id
    ]);

    res.json({ message: 'Atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar culinarista:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM culinaristas WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Culinarista não encontrado' });
    const culinarista = rows[0];

    if (culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    await pool.query(`DELETE FROM culinaristas WHERE id = $1`, [id]);
    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao deletar culinarista:', err);
    res.status(500).json({ error: err.message });
  }
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
