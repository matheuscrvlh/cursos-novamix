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

module.exports = router;

