const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');

const uploadCursos = createUpload('cursos');

const router = express.Router();

const cursosPath = path.join(__dirname, '../data/cursos.json');
const assentosPath = path.join(__dirname, '../data/assentos.json');

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) return [];

  return JSON.parse(content);
};

const write = (p, d) => fs.writeFileSync(p, JSON.stringify(d, null, 2));

router.get('/', (req, res) => {
  res.json(safeRead(cursosPath));
});

router.post('/', uploadCursos.array('fotos', 5), (req, res) => {
  const cursos = safeRead(cursosPath);
  const assentos = safeRead(assentosPath);

  const cursoId = uuidv4();
  const fotos = req.files
    ? req.files.map(f => `/uploads/cursos/${f.filename}`)
    : [];

  const novoCurso = {
    id: cursoId,
    nomeCurso: req.body.nomeCurso,
    culinarista: req.body.culinarista,
    categoria: req.body.categoria,
    duracao: req.body.duracao,
    data: req.body.data,
    hora: req.body.hora,
    loja: req.body.loja,
    valor: req.body.valor,
    fotos
  };

  cursos.push(novoCurso);

  // gerar 24 assentos
  for (let i = 1; i <= 24; i++) {
    assentos.push({
      id: i,
      cursoId,
      status: 'livre'
    });
  }

  write(cursosPath, cursos);
  write(assentosPath, assentos);

  res.status(201).json(novoCurso);
});

router.put('/:id', uploadCursos.array('fotos', 5), (req, res) => {
  const cursos = safeRead(cursosPath);
  const index = cursos.findIndex(c => c.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Curso não encontrado' });
  }

  if (req.files && req.files.length > 0) {
    cursos[index].fotos.forEach(foto => {
      const fotoPath = path.join(__dirname, '..', foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    });

    cursos[index].fotos = req.files.map(
      f => `/uploads/cursos/${f.filename}`
    );
  }

  cursos[index] = {
    ...cursos[index],
    nomeCurso: req.body.nomeCurso ?? cursos[index].nomeCurso,
    culinarista: req.body.culinarista ?? cursos[index].culinarista,
    categoria: req.body.categoria ?? cursos[index].categoria,
    duracao: req.body.duracao ?? cursos[index].duracao,
    valor: req.body.valor ? parseFloat(req.body.valor) : cursos[index].valor,
    data: req.body.data ?? cursos[index].data,
    hora: req.body.hora ?? cursos[index].hora,
    loja: req.body.loja ?? cursos[index].loja,
    modalidade: req.body.modalidade ?? cursos[index].modalidade
  };

  write(cursosPath, cursos);
  res.json(cursos[index]);
});

router.delete('/:id', (req, res) => {
  const cursos = safeRead(cursosPath);
  const assentos = safeRead(assentosPath);

  const cursoIndex = cursos.findIndex(c => c.id === req.params.id);

  if (cursoIndex === -1) {
    return res.status(404).json({ message: 'Curso não encontrado' });
  }

  const curso = cursos[cursoIndex];

  // apagar fotos do curso 
  if (curso.fotos && curso.fotos.length > 0) {
    curso.fotos.forEach(foto => {
      const fotoPath = path.join(__dirname, '..', foto);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    });
  }

  // romover curso
  cursos.splice(cursoIndex, 1);

  // remove assentos
  const assentosAtualizados = assentos.filter(
    a => a.cursoId !== req.params.id
  );

  write(cursosPath, cursos);
  write(assentosPath, assentosAtualizados);

  return res.status(204).send();
});
module.exports = router;
