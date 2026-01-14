const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const upload = require('../config/upload');

const router = express.Router();
const cursosFilePath = path.join(__dirname, '../data/cursos.json');

const readCursosFromFile = () => {
  if (!fs.existsSync(cursosFilePath)) {
    fs.writeFileSync(cursosFilePath, JSON.stringify([]));
  }
  return JSON.parse(fs.readFileSync(cursosFilePath, 'utf8'));
};

const writeCursosToFile = (cursos) => {
  fs.writeFileSync(cursosFilePath, JSON.stringify(cursos, null, 2));
};

router.get('/', (req, res) => {
  res.json(readCursosFromFile());
});

router.post('/', upload.single('foto'), (req, res) => {
  const cursos = readCursosFromFile();

  const novoCurso = {
    id: uuidv4(),
    nome: req.body.nome,
    culinarista: req.body.culinarista,
    foto: req.file ? `/uploads/cursos/${req.file.filename}` : null,
    data: req.body.data,
    hora: req.body.hora,
    loja: req.body.loja,
    modalidade: req.body.modalidade
  };

  cursos.push(novoCurso);
  writeCursosToFile(cursos);

  res.status(201).json(novoCurso);
});

router.put('/:id', upload.single('foto'), (req, res) => {
  const cursos = readCursosFromFile();
  const index = cursos.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Curso não encontrado' });
  }

  // remove imagem antiga se trocar
  if (req.file && cursos[index].foto) {
    const fotoPath = path.join(__dirname, '..', cursos[index].foto);
    if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
  }

  cursos[index] = {
    ...cursos[index],
    ...req.body,
    foto: req.file
      ? `/uploads/cursos/${req.file.filename}`
      : cursos[index].foto
  };

  writeCursosToFile(cursos);
  res.json(cursos[index]);
});


router.delete('/:id', (req, res) => {
  const cursos = readCursosFromFile();
  const curso = cursos.find(c => c.id === req.params.id);

  if (!curso) {
    return res.status(404).json({ message: 'Curso não encontrado' });
  }

  if (curso.foto) {
    const imgPath = path.join(__dirname, '..', curso.foto);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
  }

  writeCursosToFile(cursos.filter(c => c.id !== req.params.id));
  res.status(204).send();
});

module.exports = router;
