const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

const uploadCursos = createUpload('cursos');
const router = express.Router();
const fs = require('fs');

router.get('/', (req, res) => {
  db.all(`
    SELECT c.*,
    GROUP_CONCAT(f.url) as fotos
    FROM cursos c
    LEFT JOIN fotos f ON f.cursoId = c.id
    GROUP BY c.id
    ORDER BY c.data ASC, c.hora ASC
  `, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  });
});

router.get('/:id', (req, res) => {
  db.all(`
    SELECT c.*,
    GROUP_CONCAT(f.url) as fotos
    FROM cursos c
    LEFT JOIN fotos f ON f.cursoId = c.id
    WHERE c.id = ?
    GROUP BY c.id
  `, [req.params.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!rows.length) return res.status(404).json({ message: 'Curso não encontrado' });
    const curso = { ...rows[0], fotos: rows[0].fotos ? rows[0].fotos.split(',') : [] };
    res.json(curso);
  });
});

router.post('/', authMiddleware, uploadCursos.array('fotos', 5), (req, res) => {
  const cursoId = uuidv4();
  const { nomeCurso, culinarista, categoria, duracao, data, hora, loja, valor, ingredientes } = req.body

  if (!nomeCurso || !categoria || !duracao || !data || !hora || !loja || !valor) {
    return res.status(400).json({ error: 'Campos obrigatórios: nomeCurso, categoria, duracao, data, hora, loja, valor' });
  }

  if (!(parseFloat(valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  db.run(`
    INSERT INTO cursos
    (id, nomeCurso, culinarista, categoria, duracao, data, hora, loja, valor, ingredientes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    cursoId,
    nomeCurso,
    culinarista,
    categoria,
    duracao,
    data,
    hora,
    loja,
    valor,
    ingredientes || null
  ], function(err) {
    if (err) {
      console.error('Erro ao inserir curso:', err);
      return res.status(500).json({ error: err.message });
    }

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

    for (let i = 1; i <= 24; i++) {
      db.run(
        `INSERT INTO assentos (id, cursoId, status) VALUES (?, ?, ?)`,
        [i, cursoId, 'livre'],
        err => { if (err) console.error('Erro ao inserir assento:', err); }
      );
    }

    res.status(201).json({ cursoId, nomeCurso, culinarista, categoria, duracao, data, hora, loja, valor  });
  });
});

router.put('/:id', authMiddleware, uploadCursos.array('fotos', 5), (req, res) => {
  const id = req.params.id;

  // valor vazio/inválido não pode virar '' no banco (COALESCE só preserva o
  // valor antigo quando o parâmetro é NULL) — sem isso, um campo deixado em
  // branco no form sobrescrevia o preço do curso, e cobranças futuras caíam
  // no fallback de R$1 em pagamentos.routes.js
  if (req.body.valor !== undefined && !(parseFloat(req.body.valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  db.run(`
    UPDATE cursos SET
      nomeCurso    = COALESCE(?, nomeCurso),
      culinarista  = COALESCE(?, culinarista),
      categoria    = COALESCE(?, categoria),
      duracao      = COALESCE(?, duracao),
      data         = COALESCE(?, data),
      hora         = COALESCE(?, hora),
      loja         = COALESCE(?, loja),
      valor        = COALESCE(?, valor),
      ingredientes = ?
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
    req.body.ingredientes ?? null,
    id
  ], function(err) {
    if (err) {
      console.error('Erro ao atualizar curso:', err);
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) return res.status(404).json({ error: 'Curso não encontrado' });

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

router.delete('/:id', authMiddleware, (req, res) => {
  const id = req.params.id;

  db.get(`SELECT nomeCurso FROM cursos WHERE id = ?`, [id], (err, curso) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!curso) return res.status(404).json({ error: 'Curso não encontrado' });

    // busca fotos
    db.all(
      `SELECT url FROM fotos WHERE cursoId = ?`,
      [id],
      (err, fotos) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // remove arquivos físicos
        fotos.forEach(foto => {
          const filePath = path.join(__dirname, '..', foto.url);

          fs.unlink(filePath, err => {
            if (err) {
              console.error('Erro ao deletar arquivo:', filePath, err.message);
            }
          });
        });

        // remove do banco
        db.serialize(() => {
          // todas as inscrições sobrevivem à exclusão do curso, seja qual for
          // o status (não pode sumir com o histórico de quem já pagou,
          // reembolsou, etc.) — guarda o nome do curso nelas antes, já que a
          // linha em `cursos` vai deixar de existir
          db.run(
            `UPDATE inscricoes SET cursoRemovidoNome = ? WHERE cursoId = ?`,
            [curso.nomeCurso, id]
          );
          db.run(`DELETE FROM assentos WHERE cursoId = ?`, [id]);
          db.run(`DELETE FROM fotos WHERE cursoId = ?`, [id]);

          db.run(
            `DELETE FROM cursos WHERE id = ?`,
            [id],
            function(err) {
              if (err) {
                return res.status(500).json({ error: err.message });
              }

              res.sendStatus(204);
            }
          );
        });
      }
    );
  });
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;