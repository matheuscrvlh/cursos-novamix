const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const db = require('../db')

const uploadCursos = createUpload('cursos');

const router = express.Router();

const cursosPath = path.join(__dirname, '../data/cursos.json');
const assentosPath = path.join(__dirname, '../data/assentos.json');
const inscricoesPath = path.join(__dirname, '../data/inscricoes.json');

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) return [];

  return JSON.parse(content);
};

const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

router.get('/', (req, res) => {
  db.all(`
    SELECT c.*, 
    GROUP_CONCAT(f.url) as fotos
    FROM cursos c
    LEFT JOIN fotos f ON f.cursoId = c.id
    GROUP BY c.id
  `, [], (err, rows) => {
    if (err) return res.status(500).json(err);

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  });
});

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
  ]);

  // fotos
  if (req.files) {
    req.files.forEach(file => {
      db.run(
        `INSERT INTO fotos (cursoId, url) VALUES (?, ?)`,
        [cursoId, `/uploads/cursos/${file.filename}`]
      );
    });
  }

  // assentos
  for (let i = 1; i <= 24; i++) {
    db.run(
      `INSERT INTO assentos (id, cursoId, status) VALUES (?, ?, ?)`,
      [i, cursoId, 'livre']
    );
  }

  res.status(201).json({ id: cursoId });
});

router.put('/:id', uploadCursos.array('fotos', 5), (req, res) => {
  const id = req.params.id;

  db.run(`
    UPDATE cursos SET
      nomeCurso = COALESCE(?, nomeCurso),
      culinarista = COALESCE(?, culinarista),
      categoria = COALESCE(?, categoria),
      duracao = COALESCE(?, duracao),
      data = COALESCE(?, data),
      hora = COALESCE(?, hora),
      loja = COALESCE(?, loja),
      valor = COALESCE(?, valor)
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
  ]);

  res.json({ message: 'Atualizado' });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;

  db.run(`DELETE FROM cursos WHERE id = ?`, [id]);
  db.run(`DELETE FROM fotos WHERE cursoId = ?`, [id]);
  db.run(`DELETE FROM assentos WHERE cursoId = ?`, [id]);
  db.run(`DELETE FROM inscricoes WHERE cursoId = ?`, [id]);

  res.sendStatus(204);
});

module.exports = router;
