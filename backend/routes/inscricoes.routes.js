const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

const inscricoesPath = path.join(__dirname, '../data/inscricoes.json');
const assentosPath = path.join(__dirname, '../data/assentos.json');

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

router.post('/', (req, res) => {
  try {
    const { cursoId, nome, cpf, celular, assento } = req.body;

    // validaçao básica
    if (!cursoId || !nome || !cpf || !celular || assento === undefined) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const assentos = safeRead(assentosPath);
    const inscricoes = safeRead(inscricoesPath);

    const assentoId = Number(assento); 

    const cadeira = assentos.find(
      a => a.cursoId === cursoId && a.id === assentoId
    );

    if (!cadeira) {
      return res.status(404).json({ message: 'Assento não encontrado' });
    }

    if (cadeira.status !== 'livre') {
      return res.status(400).json({ message: 'Assento indisponível' });
    }

    // reservar assento
    cadeira.status = 'reservado';

    const novaInscricao = {
      id: uuidv4(),
      cursoId,
      nome,
      cpf,
      celular,
      assento: assentoId,
      dataInscricao: new Date().toISOString()
    };

    inscricoes.push(novaInscricao);

    safeWrite(assentosPath, assentos);
    safeWrite(inscricoesPath, inscricoes);

    res.status(201).json(novaInscricao);

  } catch (err) {
    console.error('ERRO INSCRIÇÃO:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

router.get('/curso/:cursoId', (req, res) => {
  try {
    const { cursoId } = req.params;
    const inscricoes = safeRead(inscricoesPath);
    const incricoesCurso = inscricoes.filter(i => i.cursoId === cursoId); 
    res.json(incricoesCurso);
  } catch (err) {
    console.error('ERRO AO OBTER INSCRIÇÕES:', err);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const inscricoes = safeRead(inscricoesPath);
    const index = inscricoes.findIndex(i => i.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Inscrição não encontrada' });
    }

    inscricoes.splice(index, 1);
    safeWrite(inscricoesPath, inscricoes);

    res.json({ message: 'Inscrição removida com sucesso' });
  } catch (err) {
    console.error('ERRO AO DELETAR INSCRIÇÃO:', err);
    res.status(500).json({ message: 'Erro interno no servidor' });
  }
});

module.exports = router;
