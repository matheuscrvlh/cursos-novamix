const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const cursosFilePath = path.join(__dirname, '../data/cursos.json');

const readCursosFromFile = () => {
  if (!fs.existsSync(cursosFilePath)) {
    fs.writeFileSync(cursosFilePath, JSON.stringify([]));
  }
  const data = fs.readFileSync(cursosFilePath, 'utf8');
  return JSON.parse(data);
};

const writeCursosToFile = (cursos) => {
  fs.writeFileSync(cursosFilePath, JSON.stringify(cursos, null, 2));
};

router.get('/', (req, res) => {
  res.json(readCursosFromFile());
});


router.post('/', (req, res) => {
  const cursos = readCursosFromFile();

  const novoCurso = {
    id: uuidv4(),
    nome: req.body.nome,
    culinarista: req.body.culinarista,
    foto: req.body.foto,
    data: req.body.data,
    hora: req.body.hora,
    loja: req.body.loja,
    modalidade: req.body.modalidade
  };

  cursos.push(novoCurso);
  writeCursosToFile(cursos);

  res.status(201).json(novoCurso);
});

router.put('/:id', (req, res) => {
  const cursos = readCursosFromFile();
  const index = cursos.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Curso não encontrado' });
  }

  cursos[index] = {
    ...cursos[index],
    ...req.body
  };

  writeCursosToFile(cursos);
  res.json(cursos[index]);
});

router.delete('/:id', (req, res) => {
  const cursos = readCursosFromFile();
  const filtrados = cursos.filter(c => c.id !== req.params.id);

  writeCursosToFile(filtrados);
  res.status(204).send();
});

module.exports = router;
