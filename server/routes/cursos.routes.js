const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');

const uploadCursos = createUpload('cursos');
const router = express.Router();
const fs = require('fs');

router.get('/', async (req, res) => {
  try {
    const { tipo } = req.query;
    const { rows } = await pool.query(`
      SELECT c.*,
      STRING_AGG(f.url, ',') as fotos
      FROM cursos c
      LEFT JOIN fotos f ON f."cursoId" = c.id
      ${tipo ? 'WHERE c.tipo = $1' : ''}
      GROUP BY c.id
      ORDER BY c.data ASC, c.hora ASC
    `, tipo ? [tipo] : []);

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT c.*,
      STRING_AGG(f.url, ',') as fotos
      FROM cursos c
      LEFT JOIN fotos f ON f."cursoId" = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: 'Curso não encontrado' });
    const curso = { ...rows[0], fotos: rows[0].fotos ? rows[0].fotos.split(',') : [] };
    res.json(curso);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireCursosAccess, uploadCursos.array('fotos', 5), async (req, res) => {
  const cursoId = uuidv4();
  const { nomeCurso, culinarista, categoria, duracao, data, hora, loja, valor, ingredientes } = req.body
  const tipo = req.body.tipo === 'infantil' ? 'infantil' : 'normal';
  // curso infantil tem 20 assentos por padrão, normal tem 24 — dá pra
  // sobrescrever mandando capacidade explícita no body
  const capacidade = Number(req.body.capacidade) || (tipo === 'infantil' ? 20 : 24);

  if (!nomeCurso || !categoria || !duracao || !data || !hora || !loja || !valor) {
    return res.status(400).json({ error: 'Campos obrigatórios: nomeCurso, categoria, duracao, data, hora, loja, valor' });
  }

  if (!(parseFloat(valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  try {
    await pool.query(`
      INSERT INTO cursos
      (id, "nomeCurso", tipo, culinarista, categoria, duracao, data, hora, loja, valor, ingredientes, capacidade)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    `, [
      cursoId,
      nomeCurso,
      tipo,
      culinarista,
      categoria,
      duracao,
      data,
      hora,
      loja,
      valor,
      ingredientes || null,
      capacidade
    ]);

    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const file of req.files) {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          continue;
        }

        try {
          await pool.query(
            `INSERT INTO fotos ("cursoId", url) VALUES ($1, $2)`,
            [cursoId, `/uploads/cursos/${file.filename}`]
          );
        } catch (err) {
          console.error('Erro ao inserir foto:', err);
        }
      }
    }

    for (let i = 1; i <= capacidade; i++) {
      try {
        await pool.query(
          `INSERT INTO assentos (id, "cursoId", status) VALUES ($1, $2, $3)`,
          [i, cursoId, 'livre']
        );
      } catch (err) {
        console.error('Erro ao inserir assento:', err);
      }
    }

    res.status(201).json({ cursoId, nomeCurso, tipo, culinarista, categoria, duracao, data, hora, loja, valor, capacidade });
  } catch (err) {
    console.error('Erro ao inserir curso:', err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', authenticate, requireCursosAccess, uploadCursos.array('fotos', 5), async (req, res) => {
  const id = req.params.id;

  // valor vazio/inválido não pode virar '' no banco (COALESCE só preserva o
  // valor antigo quando o parâmetro é NULL) — sem isso, um campo deixado em
  // branco no form sobrescrevia o preço do curso, e cobranças futuras caíam
  // no fallback de R$1 em pagamentos.routes.js
  if (req.body.valor !== undefined && !(parseFloat(req.body.valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  try {
    const result = await pool.query(`
      UPDATE cursos SET
        "nomeCurso"  = COALESCE($1, "nomeCurso"),
        tipo         = COALESCE($2, tipo),
        culinarista  = COALESCE($3, culinarista),
        categoria    = COALESCE($4, categoria),
        duracao      = COALESCE($5, duracao),
        data         = COALESCE($6, data),
        hora         = COALESCE($7, hora),
        loja         = COALESCE($8, loja),
        valor        = COALESCE($9, valor),
        ingredientes = $10
      WHERE id = $11
    `, [
      req.body.nomeCurso,
      req.body.tipo,
      req.body.culinarista,
      req.body.categoria,
      req.body.duracao,
      req.body.data,
      req.body.hora,
      req.body.loja,
      req.body.valor,
      req.body.ingredientes ?? null,
      id
    ]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Curso não encontrado' });

    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const file of req.files) {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          continue;
        }

        try {
          await pool.query(
            `INSERT INTO fotos ("cursoId", url) VALUES ($1, $2)`,
            [id, `/uploads/cursos/${file.filename}`]
          );
        } catch (err) {
          console.error('Erro ao inserir foto:', err);
        }
      }
    }

    res.json({ message: 'Atualizado' });
  } catch (err) {
    console.error('Erro ao atualizar curso:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    const { rows } = await pool.query(`SELECT "nomeCurso" FROM cursos WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const curso = rows[0];

    const { rows: fotos } = await pool.query(`SELECT url FROM fotos WHERE "cursoId" = $1`, [id]);

    // remove arquivos físicos
    fotos.forEach(foto => {
      const filePath = path.join(__dirname, '..', foto.url);

      fs.unlink(filePath, err => {
        if (err) {
          console.error('Erro ao deletar arquivo:', filePath, err.message);
        }
      });
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // todas as inscrições sobrevivem à exclusão do curso, seja qual for
      // o status (não pode sumir com o histórico de quem já pagou,
      // reembolsou, etc.) — guarda o nome do curso nelas antes, já que a
      // linha em `cursos` vai deixar de existir
      await client.query(
        `UPDATE inscricoes SET "cursoRemovidoNome" = $1 WHERE "cursoId" = $2`,
        [curso.nomeCurso, id]
      );
      await client.query(`DELETE FROM assentos WHERE "cursoId" = $1`, [id]);
      await client.query(`DELETE FROM fotos WHERE "cursoId" = $1`, [id]);
      await client.query(`DELETE FROM cursos WHERE id = $1`, [id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    res.sendStatus(204);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
