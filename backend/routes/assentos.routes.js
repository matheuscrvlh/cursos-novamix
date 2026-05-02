const express = require('express');
const db = require('../db');

const router = express.Router();

// GET assentos por curso
router.get('/:cursoId', (req, res) => {
  db.all(
    `SELECT * FROM assentos WHERE cursoId = ?`,
    [req.params.cursoId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// PUT atualizar assentos de um curso
router.put('/:cursoId', (req, res) => {
  const { cursoId } = req.params;
  const updatedAssentos = req.body; // array de assentos

  db.serialize(() => {
    updatedAssentos.forEach(assento => {
      db.run(
        `UPDATE assentos SET status = ? WHERE id = ? AND cursoId = ?`,
        [assento.status, assento.id, cursoId],
        err => { if (err) console.error('Erro ao atualizar assento:', err); }
      );
    });

    res.json({ message: 'Assentos atualizados com sucesso!' });
  });
});

module.exports = router;