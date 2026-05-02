const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const db = require('../db');

const uploadCulinaristas = createUpload('culinaristas');
const router = express.Router();

// GET todos os culinaristas
router.get('/', (req, res) => {
  db.all(`SELECT * FROM culinaristas`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const culinaristas = rows.map(c => ({
      ...c,
      lojas: c.lojas ? JSON.parse(c.lojas) : [],
      cursos: c.cursos ? JSON.parse(c.cursos) : []
    }));

    res.json(culinaristas);
  });
});

// POST novo culinarista
router.post('/', uploadCulinaristas.single('foto'), (req, res) => {
  const { nomeCulinarista, cpf, lojas, cursos, instagram, industria, telefone } = req.body;

  if (!nomeCulinarista || !cpf) {
    return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
  }

  const id = uuidv4();
  const foto = req.file ? `/uploads/culinaristas/${req.file.filename}` : null;
  const dataCadastro = new Date().toISOString();

  db.run(`
    INSERT INTO culinaristas
      (id, nomeCulinarista, cpf, industria, telefone, instagram, lojas, cursos, foto, dataCadastro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir culinarista:', err);
      return res.status(500).json({ message: 'Erro ao criar culinarista' });
    }

    res.status(201).json({ id, nomeCulinarista, cpf, industria, telefone, instagram, foto, dataCadastro });
  });
});

// PUT atualizar culinarista
router.put('/:id', uploadCulinaristas.single('foto'), (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM culinaristas WHERE id = ?`, [id], (err, culinarista) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!culinarista) return res.status(404).json({ message: 'Culinarista não encontrado' });

    // apagar foto antiga se uma nova for enviada
    if (req.file && culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    const novaFoto = req.file
      ? `/uploads/culinaristas/${req.file.filename}`
      : culinarista.foto;

    db.run(`
      UPDATE culinaristas SET
        nomeCulinarista = COALESCE(?, nomeCulinarista),
        cpf             = COALESCE(?, cpf),
        instagram       = COALESCE(?, instagram),
        telefone        = COALESCE(?, telefone),
        industria       = COALESCE(?, industria),
        lojas           = COALESCE(?, lojas),
        cursos          = COALESCE(?, cursos),
        foto            = ?
      WHERE id = ?
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
    ], function(err) {
      if (err) {
        console.error('Erro ao atualizar culinarista:', err);
        return res.status(500).json({ error: err.message });
      }

      res.json({ message: 'Atualizado' });
    });
  });
});

// DELETE culinarista
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM culinaristas WHERE id = ?`, [id], (err, culinarista) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!culinarista) return res.status(404).json({ message: 'Culinarista não encontrado' });

    if (culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    db.run(`DELETE FROM culinaristas WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Erro ao deletar culinarista:', err);
        return res.status(500).json({ error: err.message });
      }

      res.sendStatus(204);
    });
  });
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;