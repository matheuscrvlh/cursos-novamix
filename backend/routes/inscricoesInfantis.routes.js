const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');

const router = express.Router();

// GET todas as inscrições infantis
router.get('/', (req, res) => {
  db.all(`SELECT * FROM inscricoesInfantis`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
    res.json(rows);
  });
});

// GET inscrições infantis por curso
router.get('/curso/:cursoId', (req, res) => {
  db.all(
    `SELECT * FROM inscricoesInfantis WHERE cursoId = ?`,
    [req.params.cursoId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
      res.json(rows);
    }
  );
});

// POST nova inscrição infantil
router.post('/', (req, res) => {
  const { cursoId, nomeResponsavel, telefone, nomeCrianca, idadeCrianca, formaPagamento, cpf } = req.body;

  // verificar se o curso infantil existe
  db.get(`SELECT * FROM cursosInfantis WHERE id = ?`, [cursoId], (err, curso) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!curso) return res.status(404).json({ message: 'Curso infantil não encontrado' });

    const id = uuidv4();
    const dataInscricao = new Date().toISOString();

    db.run(`
      INSERT INTO inscricoesInfantis
        (id, cursoId, nomeResponsavel, telefone, nomeCrianca, idadeCrianca, cpf, formaPagamento, status, dataInscricao)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      cursoId,
      nomeResponsavel,
      telefone,
      nomeCrianca,
      idadeCrianca,
      cpf,
      formaPagamento,
      'verificar',
      dataInscricao
    ], function(err) {
      if (err) {
        console.error('Erro ao criar inscrição infantil:', err);
        return res.status(500).json({ message: 'Erro ao criar inscrição' });
      }

      res.status(201).json({ id, cursoId, nomeResponsavel, telefone, nomeCrianca, idadeCrianca, cpf, formaPagamento, status: 'verificar', dataInscricao });
    });
  });
});

// PUT atualizar inscrição infantil
router.put('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM inscricoesInfantis WHERE id = ?`, [id], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    db.run(`
      UPDATE inscricoesInfantis SET
        nomeResponsavel = COALESCE(?, nomeResponsavel),
        telefone        = COALESCE(?, telefone),
        nomeCrianca     = COALESCE(?, nomeCrianca),
        idadeCrianca    = COALESCE(?, idadeCrianca),
        formaPagamento  = COALESCE(?, formaPagamento),
        cpf             = COALESCE(?, cpf),
        status          = COALESCE(?, status),
        dataInscricao   = COALESCE(?, dataInscricao)
      WHERE id = ?
    `, [
      req.body.nomeResponsavel ?? null,
      req.body.telefone        ?? null,
      req.body.nomeCrianca     ?? null,
      req.body.idadeCrianca    ?? null,
      req.body.formaPagamento  ?? null,
      req.body.cpf             ?? null,
      req.body.status          ?? null,
      req.body.dataInscricao   ?? null,
      id
    ], function(err) {
      if (err) {
        console.error('Erro ao atualizar inscrição infantil:', err);
        return res.status(500).json({ message: 'Erro interno no servidor' });
      }

      res.json({ message: 'Atualizado' });
    });
  });
});

// DELETE inscrição infantil
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get(`SELECT * FROM inscricoesInfantis WHERE id = ?`, [id], (err, inscricao) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!inscricao) return res.status(404).json({ message: 'Inscrição não encontrada' });

    db.run(`DELETE FROM inscricoesInfantis WHERE id = ?`, [id], function(err) {
      if (err) {
        console.error('Erro ao deletar inscrição infantil:', err);
        return res.status(500).json({ message: 'Erro interno no servidor' });
      }

      res.sendStatus(204);
    });
  });
});

module.exports = router;