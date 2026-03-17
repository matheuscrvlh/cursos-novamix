const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadCursosInfantis = require('../config/uploadCursosInfantis');

const router = express.Router();

const cursosPath = path.join(__dirname, '../data/cursosInfantis.json');
const assentosPath = path.join(__dirname, '../data/assentos.json');

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return content.trim() ? JSON.parse(content) : [];
};

const write = (p, d) => {
  fs.writeFileSync(p, JSON.stringify(d, null, 2));
};


router.get('/', (req, res) => {
  res.json(safeRead(cursosPath));
});


router.get('/:id', (req, res) => {
  const cursos = safeRead(cursosPath);
  const curso = cursos.find(c => c.id === req.params.id);

  if (!curso) {
    return res.status(404).json({ message: 'Curso infantil não encontrado' });
  }

  res.json(curso);
});


router.post('/', uploadCursosInfantis.array('fotos', 5), (req, res) => {
  try {
    const cursos = safeRead(cursosPath);
    const assentos = safeRead(assentosPath);

    const cursoId = uuidv4();

    const fotos = req.files
      ? req.files.map(f => `/uploads/cursosInfantis/${f.filename}`)
      : [];

    const valor = parseFloat(req.body.valor);

    if (isNaN(valor)) {
      return res.status(400).json({
        message: 'Valor do curso inválido'
      });
    }

    const novoCurso = {
      id: cursoId,
      nomeCurso: req.body.nomeCurso,
      tipo: req.body.tipo,
      culinarista: req.body.culinarista,
      categoria: req.body.categoria,
      duracao: req.body.duracao,
      data: req.body.data,
      hora: req.body.hora,
      loja: req.body.loja,
      valor,
      fotos
    };

    cursos.push(novoCurso);

    
    for (let i = 1; i <= 20; i++) {
      assentos.push({
        id: i,
        cursoId,
        status: 'livre'
      });
    }

    write(cursosPath, cursos);
    write(assentosPath, assentos);

    res.status(201).json(novoCurso);

  } catch (err) {
    console.error('ERRO AO CRIAR CURSO INFANTIL:', err);
    res.status(500).json({ message: 'Erro ao criar curso infantil' });
  }
});

router.put('/:id', uploadCursosInfantis.array('fotos', 5), (req, res) => {
  try {
    const cursos = safeRead(cursosPath);
    const index = cursos.findIndex(c => c.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({
        message: 'Curso infantil não encontrado'
      });
    }

    // apagar fotos antigas
    if (req.files && req.files.length > 0) {
      cursos[index].fotos.forEach(foto => {
        const fotoPath = path.join(__dirname, '..', foto);

        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath);
        }
      });

      cursos[index].fotos = req.files.map(
        f => `/uploads/cursosInfantis/${f.filename}`
      );
    }

    cursos[index] = {
      ...cursos[index],
      nomeCurso: req.body.nomeCurso ?? cursos[index].nomeCurso,
      nomeResponsavel: req.body.nomeResponsavel ?? cursos[index].nomeResponsavel,
      nomeAluno: req.body.nomeAluno ?? cursos[index].nomeAluno,
      tipo: req.body.tipo ?? cursos[index].tipo,
      culinarista: req.body.culinarista ?? cursos[index].culinarista,
      categoria: req.body.categoria ?? cursos[index].categoria,
      duracao: req.body.duracao ?? cursos[index].duracao,
      data: req.body.data ?? cursos[index].data,
      hora: req.body.hora ?? cursos[index].hora,
      loja: req.body.loja ?? cursos[index].loja,
      modalidade: req.body.modalidade ?? cursos[index].modalidade,
      valor: req.body.valor
        ? parseFloat(req.body.valor)
        : cursos[index].valor
    };

    write(cursosPath, cursos);

    res.json(cursos[index]);

  } catch (err) {
    console.error('ERRO AO ATUALIZAR CURSO INFANTIL:', err);
    res.status(500).json({ message: 'Erro ao atualizar curso infantil' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const cursos = safeRead(cursosPath);
    const assentos = safeRead(assentosPath);

    const cursoIndex = cursos.findIndex(c => c.id === req.params.id);

    if (cursoIndex === -1) {
      return res.status(404).json({
        message: 'Curso infantil não encontrado'
      });
    }

    const curso = cursos[cursoIndex];

    // apagar fotos
    if (curso.fotos && curso.fotos.length > 0) {
      curso.fotos.forEach(foto => {
        const fotoPath = path.join(__dirname, '..', foto);

        if (fs.existsSync(fotoPath)) {
          fs.unlinkSync(fotoPath);
        }
      });
    }

    // remover curso
    cursos.splice(cursoIndex, 1);

    // remover assentos
    const assentosAtualizados = assentos.filter(
      a => a.cursoId !== req.params.id
    );

    write(cursosPath, cursos);
    write(assentosPath, assentosAtualizados);

    res.status(204).send();

  } catch (err) {
    console.error('ERRO AO EXCLUIR CURSO INFANTIL:', err);
    res.status(500).json({ message: 'Erro ao excluir curso infantil' });
  }
});

module.exports = router;