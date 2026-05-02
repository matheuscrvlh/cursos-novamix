const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const db = require('../db');

const uploadIndustria = createUpload('industrias');
const router = express.Router();

// GET todas as indústrias
router.get('/', (req, res) => {
  db.all(`SELECT * FROM industrias`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET indústria por id
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM industrias WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Indústria não encontrada' });
    res.json(row);
  });
});

// POST nova indústria
router.post('/', uploadIndustria.single('foto'), (req, res) => {
  const { razaoSocial, nome, cnpj, telefone, email, endereco, instagram, site } = req.body;
  const id = uuidv4();
  const foto = req.file ? `/uploads/industrias/${req.file.filename}` : null;
  const dataCadastro = new Date().toISOString();

  db.run(`
    INSERT INTO industrias
      (id, razaoSocial, nome, cnpj, telefone, email, endereco, instagram, site, foto, dataCadastro)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id,
    razaoSocial,
    nome,
    cnpj       || '',
    telefone   || '',
    email      || '',
    endereco   || '',
    instagram  || '',
    site       || '',
    foto,
    dataCadastro
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir indústria:', err);
      return res.status(500).json({ error: err.message });
    }

    res.status(201).json({ id, razaoSocial, nome, cnpj, telefone, email, endereco, instagram, site, foto, dataCadastro });
  });
});

// PUT atualizar indústria
router.put('/:id', uploadIndustria.single('foto'), (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM industrias WHERE id = ?`, [id], (err, industria) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!industria) return res.status(404).json({ message: 'Indústria não encontrada' });

    // apagar foto antiga se uma nova for enviada
    if (req.file && industria.foto) {
      const oldPath = path.join(__dirname, '..', industria.foto);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const novaFoto = req.file
      ? `/uploads/industrias/${req.file.filename}`
      : industria.foto;

    db.run(`
      UPDATE industrias SET
        razaoSocial = COALESCE(?, razaoSocial),
        nome        = COALESCE(?, nome),
        cnpj        = COALESCE(?, cnpj),
        telefone    = COALESCE(?, telefone),
        email       = COALESCE(?, email),
        endereco    = COALESCE(?, endereco),
        instagram   = COALESCE(?, instagram),
        site        = COALESCE(?, site),
        foto        = ?
      WHERE id = ?
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
    ], function(err) {
      if (err) {
        console.error('Erro ao atualizar indústria:', err);
        return res.status(500).json({ message: 'Erro ao atualizar indústria' });
      }

      res.json({ message: 'Atualizado' });
    });
  });
});

// DELETE indústria
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM industrias WHERE id = ?`, [id], (err, industria) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!industria) return res.status(404).json({ message: 'Indústria não encontrada' });

    if (industria.foto) {
      const imgPath = path.join(__dirname, '..', industria.foto);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    db.run(`DELETE FROM industrias WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Erro ao deletar indústria:', err);
        return res.status(500).json({ message: 'Erro ao excluir indústria' });
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