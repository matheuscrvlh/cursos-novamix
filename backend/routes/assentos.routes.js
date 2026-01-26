const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const assentosPath = path.join(__dirname, '../data/assentos.json');

const read = () => JSON.parse(fs.readFileSync(assentosPath));

router.get('/:cursoId', (req, res) => {
  const assentos = read().filter(a => a.cursoId === req.params.cursoId);
  res.json(assentos);
});

router.put('/:cursoId', (req, res) => {
  const { cursoId } = req.params;
  const updatedAssentos = req.body;

  let assentos = read();
  assentos = assentos.filter(a => a.cursoId !== cursoId).concat(updatedAssentos);
  fs.writeFileSync(assentosPath, JSON.stringify(assentos, null, 2));

  res.json({ message: 'Assentos atualizados com sucesso!' });
});

module.exports = router;

