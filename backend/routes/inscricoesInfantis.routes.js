const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const inscricoesInfantisPath = path.join(__dirname, '../data/inscricoesInfantis.json');
const cursosInfantisPath = path.join(__dirname, '../data/cursosInfantis.json');

const safeRead = (filePath) => {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify([]));
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (!content.trim()) return [];

  return JSON.parse(content);
};

const safeWrite = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

router.get('/', (req, res) => {
  res.json(safeRead(inscricoesInfantisPath));
});


router.get('/curso/:cursoId', (req, res) => {

  const { cursoId } = req.params;

  const inscricoes = safeRead(inscricoesInfantisPath);

  const resultado = inscricoes.filter(i => i.cursoId === cursoId);

  res.json(resultado);
});


router.post('/', (req, res) => {

  try {
    const {
      cursoId,
      nomeResponsavel,
      telefone,
      nomeCrianca,
      idadeCrianca,
      formaPagamento,
      cpf
    } = req.body;

    const cursos = safeRead(cursosInfantisPath);
    const curso = cursos.find(c => c.id === cursoId);

    if (!curso) {
      return res.status(404).json({
        message: 'Curso infantil não encontrado'
      });
    }

    const inscricoes = safeRead(inscricoesInfantisPath);

    const novaInscricao = {
      id: uuidv4(),
      cursoId,
      nomeResponsavel,
      telefone,
      nomeCrianca,
      idadeCrianca,
      cpf,
      formaPagamento,
      status: 'verificar',
      dataInscricao: new Date().toISOString()
    };

    inscricoes.push(novaInscricao);

    safeWrite(inscricoesInfantisPath, inscricoes);

    res.status(201).json(novaInscricao);

  } catch (err) {
    console.error('ERRO AO CRIAR INSCRIÇÃO INFANTIL:', err);
    res.status(500).json({ message: 'Erro ao criar inscrição' });
  }

});


router.put('/:id', (req, res) => {

  const inscricoes = safeRead(inscricoesInfantisPath);

  const index = inscricoes.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: 'Inscrição não encontrada'
    });
  }

  inscricoes[index] = {
    ...inscricoes[index],
    nomeResponsavel: req.body.nomeResponsavel ?? inscricoes[index].nomeResponsavel,
    telefone: req.body.telefone ?? inscricoes[index].telefone,
    nomeCrianca: req.body.nomeCrianca ?? inscricoes[index].nomeCrianca,
    idadeCrianca: req.body.idadeCrianca ?? inscricoes[index].idadeCrianca,
    formaPagamento: req.body.formaPagamento ?? inscricoes[index].formaPagamento,
    cpf: req.body.cpf ?? inscricoes[index].cpf,
    status: req.body.status ?? inscricoes[index].status,
    dataInscricao: req.body.dataInscricao ?? inscricoes[index].dataInscricao
  };

  safeWrite(inscricoesInfantisPath, inscricoes);

  res.json(inscricoes[index]);
});

router.delete('/:id', (req, res) => {

  const inscricoes = safeRead(inscricoesInfantisPath);

  const index = inscricoes.findIndex(i => i.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({
      message: 'Inscrição não encontrada'
    });
  }

  inscricoes.splice(index, 1);

  safeWrite(inscricoesInfantisPath, inscricoes);

  res.status(204).send();
});

module.exports = router;