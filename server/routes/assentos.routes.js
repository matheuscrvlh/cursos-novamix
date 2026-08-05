const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

const router = express.Router();

const STATUS_VALIDOS = ['livre', 'reservado', 'pago'];

router.get('/:cursoId', (req, res) => {
  db.all(
    `SELECT * FROM assentos WHERE cursoId = ? ORDER BY id ASC`,
    [req.params.cursoId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!rows.length) return res.status(404).json({ error: 'Curso não encontrado' });
      res.json(rows);
    }
  );
});

router.put('/:cursoId', authMiddleware, (req, res) => {
  const { cursoId } = req.params;
  const updatedAssentos = (Array.isArray(req.body) ? req.body : [])
    .filter(a => STATUS_VALIDOS.includes(a.status));

  db.serialize(() => {
    updatedAssentos.forEach(assento => {
      if (assento.status === 'livre') {
        // liberar um assento é sempre seguro, não precisa de trava
        db.run(
          `UPDATE assentos SET status = 'livre' WHERE id = ? AND cursoId = ?`,
          [assento.id, cursoId],
          err => { if (err) console.error('Erro ao liberar assento:', err); }
        );
      } else {
        // trava atômica: só ocupa se ainda estiver livre — evita sobrescrever
        // um assento que já foi reservado/pago por outra requisição nesse meio tempo
        db.run(
          `UPDATE assentos SET status = ? WHERE id = ? AND cursoId = ? AND status = 'livre'`,
          [assento.status, assento.id, cursoId],
          err => { if (err) console.error('Erro ao atualizar assento:', err); }
        );
      }
    });

    res.json({ message: 'Assentos atualizados com sucesso!' });
  });
});

module.exports = router;