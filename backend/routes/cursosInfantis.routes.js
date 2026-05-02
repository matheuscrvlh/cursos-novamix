const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const db = require('../db');

const uploadCursosInfantis = createUpload('cursosInfantis');
const router = express.Router();

// GET todos os cursos infantis
router.get('/', (req, res) => {
  db.all(`
    SELECT ci.*,
    GROUP_CONCAT(f.url) as fotos
    FROM cursosInfantis ci
    LEFT JOIN fotos f ON f.cursoId = ci.id
    GROUP BY ci.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  });
});

// GET curso infantil por id
router.get('/:id', (req, res) => {
  db.get(`
    SELECT ci.*,
    GROUP_CONCAT(f.url) as fotos
    FROM cursosInfantis ci
    LEFT JOIN fotos f ON f.cursoId = ci.id
    WHERE ci.id = ?
    GROUP BY ci.id
  `, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ message: 'Curso infantil não encontrado' });

    res.json({
      ...row,
      fotos: row.fotos ? row.fotos.split(',') : []
    });
  });
});

// POST novo curso infantil
router.post('/', uploadCursosInfantis.array('fotos', 5), (req, res) => {
  const cursoId = uuidv4();
  const valor = parseFloat(req.body.valor);

  db.run(`
    INSERT INTO cursosInfantis
      (id, nomeCurso, tipo, culinarista, categoria, duracao, data, hora, loja, valor)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cursoId,
    req.body.nomeCurso,
    req.body.tipo,
    req.body.culinarista,
    req.body.categoria,
    req.body.duracao,
    req.body.data,
    req.body.hora,
    req.body.loja,
    valor
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir curso infantil:', err);
      return res.status(500).json({ message: 'Erro ao criar curso infantil' });
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
          [cursoId, `/uploads/cursosInfantis/${file.filename}`],
          err => { if (err) console.error('Erro ao inserir foto:', err); }
        );
      });
    }

    // assentos — cursos infantis têm 20 (vs 24 dos adultos)
    for (let i = 1; i <= 20; i++) {
      db.run(
        `INSERT INTO assentos (id, cursoId, status) VALUES (?, ?, ?)`,
        [i, cursoId, 'livre'],
        err => { if (err) console.error('Erro ao inserir assento:', err); }
      );
    }

    res.status(201).json({ id: cursoId });
  });
});

// PUT atualizar curso infantil
router.put('/:id', uploadCursosInfantis.array('fotos', 5), (req, res) => {
  const { id } = req.params;

  // se vieram novas fotos, apaga as antigas do disco e do banco
  if (req.files && req.files.length > 0) {
    db.all(`SELECT url FROM fotos WHERE cursoId = ?`, [id], (err, fotos) => {
      if (!err) {
        fotos.forEach(({ url }) => {
          const fotoPath = path.join(__dirname, '..', url);
          if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
        });
      }

      db.run(`DELETE FROM fotos WHERE cursoId = ?`, [id], err => {
        if (err) console.error('Erro ao deletar fotos antigas:', err);
      });

      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      req.files.forEach(file => {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          return;
        }

        db.run(
          `INSERT INTO fotos (cursoId, url) VALUES (?, ?)`,
          [id, `/uploads/cursosInfantis/${file.filename}`],
          err => { if (err) console.error('Erro ao inserir foto:', err); }
        );
      });
    });
  }

  db.run(`
    UPDATE cursosInfantis SET
      nomeCurso       = COALESCE(?, nomeCurso),
      nomeResponsavel = COALESCE(?, nomeResponsavel),
      nomeAluno       = COALESCE(?, nomeAluno),
      tipo            = COALESCE(?, tipo),
      culinarista     = COALESCE(?, culinarista),
      categoria       = COALESCE(?, categoria),
      duracao         = COALESCE(?, duracao),
      data            = COALESCE(?, data),
      hora            = COALESCE(?, hora),
      loja            = COALESCE(?, loja),
      modalidade      = COALESCE(?, modalidade),
      valor           = COALESCE(?, valor)
    WHERE id = ?
  `, [
    req.body.nomeCurso       ?? null,
    req.body.nomeResponsavel ?? null,
    req.body.nomeAluno       ?? null,
    req.body.tipo            ?? null,
    req.body.culinarista     ?? null,
    req.body.categoria       ?? null,
    req.body.duracao         ?? null,
    req.body.data            ?? null,
    req.body.hora            ?? null,
    req.body.loja            ?? null,
    req.body.modalidade      ?? null,
    req.body.valor ? parseFloat(req.body.valor) : null,
    id
  ], function(err) {
    if (err) {
      console.error('Erro ao atualizar curso infantil:', err);
      return res.status(500).json({ message: 'Erro ao atualizar curso infantil' });
    }

    res.json({ message: 'Atualizado' });
  });
});

// DELETE curso infantil e tudo relacionado
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM cursosInfantis WHERE id = ?`, [id], (err, curso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!curso) return res.status(404).json({ message: 'Curso infantil não encontrado' });

    // apagar fotos do disco
    db.all(`SELECT url FROM fotos WHERE cursoId = ?`, [id], (err, fotos) => {
      if (!err) {
        fotos.forEach(({ url }) => {
          const fotoPath = path.join(__dirname, '..', url);
          if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
        });
      }

      db.serialize(() => {
        db.run(`DELETE FROM inscricoes WHERE cursoId = ?`, [id],
          err => { if (err) console.error('Erro ao deletar inscrições:', err); }
        );
        db.run(`DELETE FROM assentos WHERE cursoId = ?`, [id],
          err => { if (err) console.error('Erro ao deletar assentos:', err); }
        );
        db.run(`DELETE FROM fotos WHERE cursoId = ?`, [id],
          err => { if (err) console.error('Erro ao deletar fotos:', err); }
        );
        db.run(`DELETE FROM cursosInfantis WHERE id = ?`, [id], function(err) {
          if (err) {
            console.error('Erro ao deletar curso infantil:', err);
            return res.status(500).json({ message: 'Erro ao excluir curso infantil' });
          }

          res.sendStatus(204);
        });
      });
    });
  });
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;