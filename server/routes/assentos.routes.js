const express = require('express');
const pool = require('../db');

const router = express.Router();

// Não existe mais tabela de assentos — o mapa é computado na hora: todo
// número de 1 até a capacidade do curso é um "assento", e está 'reservado'
// se alguma inscrição ativa (pendente/pago/reembolsando) já o reivindicou,
// senão está 'livre'. Contrato de resposta (array de {id, cursoId, status})
// continua o mesmo que o frontend já espera.
router.get('/:cursoId', async (req, res) => {
  try {
    const { rows: cursoRows } = await pool.query(
      `SELECT capacidade FROM cursos WHERE id = $1`,
      [req.params.cursoId]
    );
    if (!cursoRows.length) return res.status(404).json({ error: 'Curso não encontrado' });

    const { rows } = await pool.query(`
      SELECT
        gs.id,
        $1::uuid AS "cursoId",
        CASE WHEN i.assento IS NULL THEN 'livre' ELSE 'reservado' END AS status
      FROM generate_series(1, $2) AS gs(id)
      LEFT JOIN inscricoes i
        ON i.curso_id = $1 AND i.assento = gs.id
        AND i.status IN ('pendente', 'pago', 'reembolsando')
      ORDER BY gs.id ASC
    `, [req.params.cursoId, cursoRows[0].capacidade]);

    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
