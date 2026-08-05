const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth.middleware');
const db = require('../db');

const router = express.Router();

router.get('/', authMiddleware, (req, res) => {
  db.all(`SELECT * FROM inscricoesInfantis`, [], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
    res.json(rows);
  });
});

router.get('/curso/:cursoId', authMiddleware, (req, res) => {
  db.all(
    `SELECT * FROM inscricoesInfantis WHERE cursoId = ?`,
    [req.params.cursoId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Erro interno do servidor' });
      res.json(rows);
    }
  );
});

router.post('/', (req, res) => {
  const { cursoId, nomeResponsavel, telefone, nomeCrianca, idadeCrianca, formaPagamento, cpf } = req.body;

  db.get(`SELECT * FROM cursosInfantis WHERE id = ?`, [cursoId], (err, curso) => {
    if (err) return res.status(500).json({ message: 'Erro interno no servidor' });
    if (!curso) return res.status(404).json({ message: 'Curso infantil não encontrado' });

    // curso infantil não reserva assento nominal (não tem coluna `assento`
    // aqui), então trava a vaga contando contra a capacidade da tabela
    // `assentos` gerada na criação do curso (20 por curso) — sem isso, um
    // curso lotado continuava aceitando inscrições sem limite
    db.get(
      `SELECT
         (SELECT COUNT(*) FROM assentos WHERE cursoId = ?) AS capacidade,
         (SELECT COUNT(*) FROM inscricoesInfantis WHERE cursoId = ? AND status != 'cancelado') AS ocupadas`,
      [cursoId, cursoId],
      (err2, contagem) => {
        if (err2) return res.status(500).json({ message: 'Erro interno no servidor' });
        if (contagem.capacidade > 0 && contagem.ocupadas >= contagem.capacidade) {
          return res.status(400).json({ message: 'Curso lotado' });
        }

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
          'pendente',
          dataInscricao
        ], function(err3) {
          if (err3) {
            console.error('Erro ao criar inscrição infantil:', err3);
            return res.status(500).json({ message: 'Erro ao criar inscrição' });
          }

          res.status(201).json({ id, cursoId, nomeResponsavel, telefone, nomeCrianca, idadeCrianca, cpf, formaPagamento, status: 'pendente', dataInscricao });
        });
      }
    );
  });
});

router.put('/:id', authMiddleware, (req, res) => {
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

router.delete('/:id', authMiddleware, (req, res) => {
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