const express = require('express');
const { authenticate, requireCursosAccess } = require('../middleware/auth.middleware');
const pool = require('../db');

const router = express.Router();

const STATUS_VALIDOS = ['livre', 'reservado', 'pago'];

router.get('/:cursoId', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM assentos WHERE "cursoId" = $1 ORDER BY id ASC`,
      [req.params.cursoId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Curso não encontrado' });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:cursoId', authenticate, requireCursosAccess, async (req, res) => {
  const { cursoId } = req.params;
  const updatedAssentos = (Array.isArray(req.body) ? req.body : [])
    .filter(a => STATUS_VALIDOS.includes(a.status));

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const assento of updatedAssentos) {
      if (assento.status === 'livre') {
        // liberar um assento é sempre seguro, não precisa de trava
        await client.query(
          `UPDATE assentos SET status = 'livre' WHERE id = $1 AND "cursoId" = $2`,
          [assento.id, cursoId]
        );
      } else {
        // trava atômica: só ocupa se ainda estiver livre — evita sobrescrever
        // um assento que já foi reservado/pago por outra requisição nesse meio tempo
        await client.query(
          `UPDATE assentos SET status = $1 WHERE id = $2 AND "cursoId" = $3 AND status = 'livre'`,
          [assento.status, assento.id, cursoId]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Assentos atualizados com sucesso!' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar assentos:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  } finally {
    client.release();
  }
});

module.exports = router;
