const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const db = require('../db');

const uploadCursos = createUpload('cursos');
const router = express.Router();

// GET todos os cursos
router.get('/', (req, res) => {
  db.all(`
    SELECT c.*, 
    GROUP_CONCAT(f.url) as fotos
    FROM cursos c
    LEFT JOIN fotos f ON f.cursoId = c.id
    GROUP BY c.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  });
});

// POST novo curso
router.post('/', uploadCursos.array('fotos', 5), (req, res) => {
  const cursoId = uuidv4();

  db.run(`
    INSERT INTO cursos 
    (id, nomeCurso, culinarista, categoria, duracao, data, hora, loja, valor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cursoId,
    req.body.nomeCurso,
    req.body.culinarista,
    req.body.categoria,
    req.body.duracao,
    req.body.data,
    req.body.hora,
    req.body.loja,
    req.body.valor
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir curso:', err);
      return res.status(500).json({ error: err.message });
    }

    // fotos
    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      req.files.forEach(file => {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          return;
        }

        db.run(
          `INSERT INTO fotos (cursoId, url) VALUES (?, ?)`,
          [cursoId, `/uploads/cursos/${file.filename}`],
          err => { if (err) console.error('Erro ao inserir foto:', err); }
        );
      });
    }

    // assentos
    for (let i = 1; i <= 24; i++) {
      db.run(
        `INSERT INTO assentos (id, cursoId, status) VALUES (?, ?, ?)`,
        [i, cursoId, 'livre'],
        err => { if (err) console.error('Erro ao inserir assento:', err); }
      );
    }

    res.status(201).json({ id: cursoId });
  });
});

// PUT atualizar curso
router.put('/:id', uploadCursos.array('fotos', 5), (req, res) => {
  const id = req.params.id;

  db.run(`
    UPDATE cursos SET
      nomeCurso   = COALESCE(?, nomeCurso),
      culinarista = COALESCE(?, culinarista),
      categoria   = COALESCE(?, categoria),
      duracao     = COALESCE(?, duracao),
      data        = COALESCE(?, data),
      hora        = COALESCE(?, hora),
      loja        = COALESCE(?, loja),
      valor       = COALESCE(?, valor)
    WHERE id = ?
  `, [
    req.body.nomeCurso,
    req.body.culinarista,
    req.body.categoria,
    req.body.duracao,
    req.body.data,
    req.body.hora,
    req.body.loja,
    req.body.valor,
    id
  ], function(err) {
    if (err) {
      console.error('Erro ao atualizar curso:', err);
      return res.status(500).json({ error: err.message });
    }

    // novas fotos enviadas no PUT
    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      req.files.forEach(file => {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          return;
        }

        db.run(
          `INSERT INTO fotos (cursoId, url) VALUES (?, ?)`,
          [id, `/uploads/cursos/${file.filename}`],
          err => { if (err) console.error('Erro ao inserir foto:', err); }
        );
      });
    }

    res.json({ message: 'Atualizado' });
  });
});

// DELETE curso e tudo relacionado
router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.serialize(() => {
    db.run(`DELETE FROM inscricoes WHERE cursoId = ?`, [id], err => {
      if (err) console.error('Erro ao deletar inscrições:', err);
    });
    db.run(`DELETE FROM assentos WHERE cursoId = ?`, [id], err => {
      if (err) console.error('Erro ao deletar assentos:', err);
    });
    db.run(`DELETE FROM fotos WHERE cursoId = ?`, [id], err => {
      if (err) console.error('Erro ao deletar fotos:', err);
    });
    db.run(`DELETE FROM cursos WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Erro ao deletar curso:', err);
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