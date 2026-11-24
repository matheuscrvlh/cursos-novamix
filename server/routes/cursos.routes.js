const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const tratarErroUpload = require('../middleware/uploadErro.middleware');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');
const logAudit = require('../utils/logAudit');
const { formatarTitulo } = require('../utils/titulo');
const { enviarEmail, emailCursoCancelado, emailCursoRemarcado } = require('../utils/email');
const { reembolsarInscricao } = require('./pagamentos.routes');

// marcas das indústrias parceiras — ficam com maiúscula no nome do curso
// (ver utils/titulo.js)
async function nomesDasIndustrias() {
  const { rows } = await pool.query(`SELECT nome FROM industrias`);
  return rows.map(r => r.nome);
}

const uploadCursos = createUpload('cursos');
const CAPACIDADE_MAXIMA = 200;
const router = express.Router();
const fs = require('fs');

// loja (texto "Prado"/"Teresopolis", contrato que o frontend já usa) resolve
// pro filial_id de public.branchs (nome real é "Novamix Prado" etc.)
async function resolverFilialId(loja) {
  if (!loja) return null;
  const { rows } = await pool.query(
    `SELECT id FROM public.branchs WHERE name ILIKE '%' || $1 || '%' LIMIT 1`,
    [loja]
  );
  return rows[0]?.id ?? null;
}

// select comum que devolve o formato que o frontend já espera (nomeCurso,
// cursoId, loja em texto, data/hora separados, ativo como 'true'/'false') —
// resolve culinarista/filial via JOIN em vez de guardar snapshot de texto.
// GROUP BY c.id, cu.id, b.id: como cu.id/b.id são PK das suas tabelas, o
// Postgres libera o resto das colunas de cada uma sem precisar agregar
// (dependência funcional) — só f.url (N fotos por curso) precisa de STRING_AGG.
const SELECT_CURSO = `
  SELECT
    c.id,
    c.nome_curso AS "nomeCurso",
    c.tipo,
    c.culinarista_id AS "culinaristaId",
    cu.nome_culinarista AS culinarista,
    c.filial_id AS "filialId",
    REPLACE(b.name, 'Novamix ', '') AS loja,
    c.categoria,
    c.duracao,
    to_char(c.data, 'YYYY-MM-DD') AS data,
    to_char(c.data, 'HH24:MI') AS hora,
    c.valor,
    c.ingredientes,
    c.capacidade,
    CASE WHEN c.status THEN 'true' ELSE 'false' END AS ativo,
    c.criado_em AS "criadoEm",
    c.cancelado_em AS "canceladoEm",
    c.motivo_cancelamento AS "motivoCancelamento",
    STRING_AGG(f.url, ',') AS fotos
  FROM cursos c
  LEFT JOIN culinaristas cu ON cu.id = c.culinarista_id
  LEFT JOIN public.branchs b ON b.id = c.filial_id
  LEFT JOIN fotos f ON f.curso_id = c.id
`;
const GROUP_BY_CURSO = 'GROUP BY c.id, cu.id, b.id';

// suporta os mesmos filtros que o front já aplicava em JS depois de buscar
// tudo (loja, culinarista, status ativo/encerrado, período) — hoje o
// DadosContext ainda busca sem filtro nenhum (dataset pequeno, cabe cachear
// uma vez só), mas a rota aceita pra quem quiser uma consulta mais específica
router.get('/', async (req, res) => {
  try {
    const { tipo, loja, culinarista, status, dataInicio, dataFim } = req.query;
    const condicoes = [];
    const valores = [];

    if (tipo) {
      valores.push(tipo);
      condicoes.push(`c.tipo = $${valores.length}`);
    }
    if (loja) {
      valores.push(loja);
      condicoes.push(`REPLACE(b.name, 'Novamix ', '') = $${valores.length}`);
    }
    if (culinarista) {
      valores.push(culinarista);
      condicoes.push(`cu.nome_culinarista = $${valores.length}`);
    }
    if (status === 'ativos') {
      condicoes.push(`c.data > now()`);
    } else if (status === 'concluidos') {
      condicoes.push(`c.data <= now()`);
    }
    if (dataInicio) {
      valores.push(dataInicio);
      condicoes.push(`c.data >= $${valores.length}`);
    }
    if (dataFim) {
      valores.push(dataFim);
      condicoes.push(`c.data < $${valores.length}`);
    }

    const where = condicoes.length ? `WHERE ${condicoes.join(' AND ')}` : '';

    const { rows } = await pool.query(`
      ${SELECT_CURSO}
      ${where}
      ${GROUP_BY_CURSO}
      ORDER BY c.data ASC
    `, valores);

    const cursos = rows.map(c => ({
      ...c,
      fotos: c.fotos ? c.fotos.split(',') : []
    }));

    res.json(cursos);
  } catch (err) {
    console.error(`Erro em ${req.method} ${req.baseUrl}${req.path}:`, err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(`
      ${SELECT_CURSO}
      WHERE c.id = $1
      ${GROUP_BY_CURSO}
    `, [req.params.id]);

    if (!rows.length) return res.status(404).json({ message: 'Curso não encontrado' });
    const curso = { ...rows[0], fotos: rows[0].fotos ? rows[0].fotos.split(',') : [] };
    res.json(curso);
  } catch (err) {
    console.error(`Erro em ${req.method} ${req.baseUrl}${req.path}:`, err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.post('/', authenticate, requireCursosAccess, uploadCursos.array('fotos', 5), async (req, res) => {
  const cursoId = uuidv4();
  const { culinaristaId, categoria, duracao, data, hora, loja, valor, ingredientes } = req.body
  let nomeCurso = req.body.nomeCurso
  const tipo = req.body.tipo === 'infantil' ? 'infantil' : 'normal';
  // curso infantil tem 20 assentos por padrão, normal tem 24 — dá pra
  // sobrescrever mandando capacidade explícita no body
  const capacidade = Number(req.body.capacidade) || (tipo === 'infantil' ? 20 : 24);

  if (!nomeCurso || !categoria || !duracao || !data || !hora || !loja || !valor || !culinaristaId) {
    return res.status(400).json({ error: 'Campos obrigatórios: nomeCurso, culinaristaId, categoria, duracao, data, hora, loja, valor' });
  }

  if (!(parseFloat(valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  // a rota pública de assentos gera uma linha por assento (generate_series)
  // — sem teto, um número absurdo digitado por engano deixava cada visita à
  // página do curso gerando milhões de linhas
  if (!Number.isInteger(capacidade) || capacidade < 1 || capacidade > CAPACIDADE_MAXIMA) {
    return res.status(400).json({ error: `Capacidade deve ser um número inteiro entre 1 e ${CAPACIDADE_MAXIMA}` });
  }

  try {
    nomeCurso = formatarTitulo(nomeCurso, await nomesDasIndustrias());
    const filialId = await resolverFilialId(loja);
    if (!filialId) return res.status(400).json({ error: 'Loja inválida' });

    await pool.query(`
      INSERT INTO cursos
      (id, nome_curso, tipo, culinarista_id, filial_id, categoria, duracao, data, valor, ingredientes, capacidade)
      VALUES ($1, $2, $3, $4, $5, $6, $7, ($8 || ' ' || $9)::timestamp, $10, $11, $12)
    `, [
      cursoId,
      nomeCurso,
      tipo,
      culinaristaId,
      filialId,
      categoria,
      duracao,
      data,
      hora,
      valor,
      ingredientes || null,
      capacidade
    ]);

    logAudit({ entityType: 'curso', entityId: cursoId, action: 'criar', details: nomeCurso, userHubId: req.user?.sub });

    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const file of req.files) {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          continue;
        }

        try {
          await pool.query(
            `INSERT INTO fotos (curso_id, url) VALUES ($1, $2)`,
            [cursoId, `/uploads/cursos/${file.filename}`]
          );
        } catch (err) {
          console.error('Erro ao inserir foto:', err);
        }
      }
    }

    res.status(201).json({ cursoId, nomeCurso, tipo, culinaristaId, categoria, duracao, data, hora, loja, valor, capacidade });
  } catch (err) {
    console.error('Erro ao inserir curso:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Avisa por e-mail quem está inscrito (pago ou reserva pendente) que o curso
// mudou de data/hora. Best-effort: roda depois da resposta e nunca lança
async function avisarRemarcacao(id, dataAntes, userHubId) {
  try {
    const { rows } = await pool.query(`
      SELECT c.nome_curso AS "nomeCurso",
             to_char(c.data,'DD/MM/YYYY') AS "dataCurso",
             to_char(c.data,'HH24:MI') AS "horaCurso",
             REPLACE(b.name, 'Novamix ', '') AS loja,
             to_char(c.data,'YYYY-MM-DD HH24:MI:SS') <> $2 AS mudou,
             c.data > now() AND c.cancelado_em IS NULL AS avisar
      FROM cursos c
      LEFT JOIN public.branchs b ON b.id = c.filial_id
      WHERE c.id = $1
    `, [id, dataAntes.bruta]);
    const curso = rows[0];
    if (!curso || !curso.mudou || !curso.avisar) return;

    // o lembrete de "seu curso é amanhã" já enviado era da data antiga
    await pool.query(
      `UPDATE inscricoes SET lembrete_enviado_em = NULL WHERE curso_id = $1 AND status = 'pago'`,
      [id]
    );

    const { rows: inscritos } = await pool.query(
      `SELECT nome, email FROM inscricoes WHERE curso_id = $1 AND status IN ('pago', 'pendente')`,
      [id]
    );
    logAudit({
      entityType: 'curso', entityId: id, action: 'remarcar',
      details: `${curso.nomeCurso}: ${dataAntes.dataBr} ${dataAntes.hora} → ${curso.dataCurso} ${curso.horaCurso} (${inscritos.length} avisados)`,
      userHubId,
    });

    for (const inscrito of inscritos) {
      const { subject, html } = emailCursoRemarcado({
        nome: inscrito.nome,
        nomeCurso: curso.nomeCurso,
        dataAntiga: dataAntes.dataBr,
        horaAntiga: dataAntes.hora,
        dataCurso: curso.dataCurso,
        horaCurso: curso.horaCurso,
        loja: curso.loja,
      });
      await enviarEmail({ to: inscrito.email, subject, html });
    }
  } catch (err) {
    console.error(`Erro ao avisar remarcação do curso ${id}:`, err);
  }
}

router.put('/:id', authenticate, requireCursosAccess, uploadCursos.array('fotos', 5), async (req, res) => {
  const id = req.params.id;

  // valor vazio/inválido não pode virar '' no banco (COALESCE só preserva o
  // valor antigo quando o parâmetro é NULL) — sem isso, um campo deixado em
  // branco no form sobrescrevia o preço do curso, e cobranças futuras caíam
  // no fallback de R$1 em pagamentos.routes.js
  if (req.body.valor !== undefined && !(parseFloat(req.body.valor) > 0)) {
    return res.status(400).json({ error: 'Valor do curso inválido' });
  }

  // culinarista_id é NOT NULL — diferente de loja/data, não existe "limpar"
  // aqui, só troca por outra culinarista válida
  if (req.body.culinaristaId !== undefined && !req.body.culinaristaId) {
    return res.status(400).json({ error: 'Culinarista inválida' });
  }

  try {
    const nomeCurso = formatarTitulo(req.body.nomeCurso, await nomesDasIndustrias());
    const culinaristaInformado = req.body.culinaristaId !== undefined;
    const novoCulinaristaId = culinaristaInformado ? req.body.culinaristaId : null;

    const lojaInformada = req.body.loja !== undefined;
    let novoFilialId = null;
    if (lojaInformada) {
      novoFilialId = await resolverFilialId(req.body.loja);
      if (!novoFilialId) return res.status(400).json({ error: 'Loja inválida' });
    }

    // data e hora são uma coluna só (TIMESTAMP) — se só um dos dois veio no
    // body, busca o outro no banco pra não perder metade do horário
    let novaData = null;
    let dataAntes = null; // pra saber, depois de salvar, se o curso foi remarcado
    if (req.body.data !== undefined || req.body.hora !== undefined) {
      const { rows: atual } = await pool.query(
        `SELECT to_char(data,'YYYY-MM-DD') AS data, to_char(data,'HH24:MI') AS hora,
                to_char(data,'DD/MM/YYYY') AS "dataBr",
                to_char(data,'YYYY-MM-DD HH24:MI:SS') AS bruta
         FROM cursos WHERE id = $1`,
        [id]
      );
      if (!atual.length) return res.status(404).json({ error: 'Curso não encontrado' });
      dataAntes = atual[0];
      const dataFinal = req.body.data ?? atual[0].data;
      const horaFinal = req.body.hora ?? atual[0].hora;
      novaData = `${dataFinal} ${horaFinal}`;
    }

    const result = await pool.query(`
      UPDATE cursos SET
        nome_curso     = COALESCE($1, nome_curso),
        tipo           = COALESCE($2, tipo),
        culinarista_id = CASE WHEN $11 THEN $3 ELSE culinarista_id END,
        filial_id      = CASE WHEN $12 THEN $4 ELSE filial_id END,
        categoria      = COALESCE($5, categoria),
        duracao        = COALESCE($6, duracao),
        data           = COALESCE($7::timestamp, data),
        valor          = COALESCE($8, valor),
        ingredientes   = $9
      WHERE id = $10
    `, [
      nomeCurso,
      req.body.tipo,
      novoCulinaristaId,
      novoFilialId,
      req.body.categoria,
      req.body.duracao,
      novaData,
      req.body.valor,
      req.body.ingredientes ?? null,
      id,
      culinaristaInformado,
      lojaInformada,
    ]);

    if (result.rowCount === 0) return res.status(404).json({ error: 'Curso não encontrado' });

    logAudit({ entityType: 'curso', entityId: id, action: 'editar', details: nomeCurso || null, userHubId: req.user?.sub });

    if (req.files && req.files.length > 0) {
      const permitidos = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      for (const file of req.files) {
        if (!permitidos.includes(file.mimetype)) {
          console.warn(`Arquivo ignorado (tipo não permitido): ${file.originalname}`);
          continue;
        }

        try {
          await pool.query(
            `INSERT INTO fotos (curso_id, url) VALUES ($1, $2)`,
            [id, `/uploads/cursos/${file.filename}`]
          );
        } catch (err) {
          console.error('Erro ao inserir foto:', err);
        }
      }
    }

    res.json({ message: 'Atualizado' });

    // remarcou (data ou hora diferente)? avisa os inscritos por e-mail, depois
    // da resposta pra não segurar o painel. Só curso que ainda vai acontecer e
    // não foi cancelado. O lembrete de 24h volta a valer pra nova data
    if (dataAntes) avisarRemarcacao(id, dataAntes, req.user?.sub);
  } catch (err) {
    console.error('Erro ao atualizar curso:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Cancela um curso que ainda vai acontecer. Ele continua no site com o aviso
// de cancelado até a data/hora em que aconteceria (o site já esconde sozinho
// os cursos que passaram da hora). Na hora do cancelamento:
//  - reservas pendentes (não pagas) são canceladas e liberam o assento;
//  - inscrições pagas são reembolsadas no Mercado Pago, uma a uma. Se o MP
//    recusar algum estorno (ex: pagamento aprovado há poucos minutos), a
//    inscrição continua 'pago' e volta na resposta em `falhas`, para o admin
//    reembolsar depois pelo botão de sempre;
//  - todo mundo recebe um e-mail avisando (depois da resposta).
// Só admin do módulo: mexe com o dinheiro dos inscritos e não tem volta.
router.post('/:id/cancelar', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;
  const motivo = typeof req.body.motivo === 'string' ? req.body.motivo.trim().slice(0, 300) : '';

  try {
    // trava atômica: dois cliques (ou dois admins) não cancelam/reembolsam duas vezes
    const { rows } = await pool.query(`
      UPDATE cursos SET cancelado_em = now(), cancelado_por = $2, motivo_cancelamento = $3
      WHERE id = $1 AND cancelado_em IS NULL AND data > now()
      RETURNING nome_curso AS "nomeCurso", to_char(data,'DD/MM/YYYY') AS "dataCurso", to_char(data,'HH24:MI') AS "horaCurso"
    `, [id, req.user?.sub ?? null, motivo || null]);

    if (!rows.length) {
      const { rows: atual } = await pool.query(`SELECT cancelado_em, data > now() AS futuro FROM cursos WHERE id = $1`, [id]);
      if (!atual.length) return res.status(404).json({ error: 'Curso não encontrado' });
      if (atual[0].cancelado_em) return res.status(409).json({ error: 'Este curso já está cancelado' });
      return res.status(400).json({ error: 'Não dá para cancelar um curso que já aconteceu' });
    }
    const curso = rows[0];

    logAudit({ entityType: 'curso', entityId: id, action: 'cancelar', details: motivo ? `${curso.nomeCurso} — ${motivo}` : curso.nomeCurso, userHubId: req.user?.sub });

    const { rows: pendentes } = await pool.query(
      `UPDATE inscricoes SET status = 'cancelado' WHERE curso_id = $1 AND status = 'pendente' RETURNING nome, email`,
      [id]
    );

    const { rows: pagas } = await pool.query(
      `SELECT id, nome, email FROM inscricoes WHERE curso_id = $1 AND status = 'pago'`,
      [id]
    );
    const reembolsadas = [];
    const falhas = [];
    for (const inscricao of pagas) {
      const resultado = await reembolsarInscricao({ inscricaoId: inscricao.id, userHubId: req.user?.sub });
      if (resultado.ok) reembolsadas.push(inscricao);
      else falhas.push({ ...inscricao, motivo: resultado.message });
    }

    res.json({
      cancelado: true,
      reservasCanceladas: pendentes.length,
      reembolsadas: reembolsadas.length,
      falhas: falhas.map(f => ({ id: f.id, nome: f.nome, motivo: f.motivo })),
    });

    // e-mails são best-effort e saem depois da resposta
    const avisar = [
      ...reembolsadas.map(i => ({ ...i, situacao: 'reembolsado' })),
      ...falhas.map(i => ({ ...i, situacao: 'reembolso_pendente' })),
      ...pendentes.map(i => ({ ...i, situacao: 'sem_pagamento' })),
    ];
    for (const inscrito of avisar) {
      const { subject, html } = emailCursoCancelado({ ...curso, nome: inscrito.nome, motivo, situacao: inscrito.situacao });
      enviarEmail({ to: inscrito.email, subject, html });
    }
  } catch (err) {
    console.error('Erro ao cancelar curso:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Desfaz o cancelamento (ex: cancelado por engano). Reembolsos já feitos não
// voltam — quem foi reembolsado precisa se inscrever de novo.
router.post('/:id/reativar', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query(`
      UPDATE cursos SET cancelado_em = NULL, cancelado_por = NULL, motivo_cancelamento = NULL
      WHERE id = $1 AND cancelado_em IS NOT NULL
      RETURNING nome_curso
    `, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Curso não encontrado ou não está cancelado' });

    logAudit({ entityType: 'curso', entityId: id, action: 'reativar', details: rows[0].nome_curso, userHubId: req.user?.sub });
    res.json({ reativado: true });
  } catch (err) {
    console.error('Erro ao reativar curso:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const id = req.params.id;

  try {
    const { rows } = await pool.query(`SELECT nome_curso FROM cursos WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ error: 'Curso não encontrado' });
    const curso = rows[0];

    const { rows: fotos } = await pool.query(`SELECT url FROM fotos WHERE curso_id = $1`, [id]);

    fotos.forEach(foto => {
      const filePath = path.join(__dirname, '..', foto.url);

      fs.unlink(filePath, err => {
        if (err) {
          console.error('Erro ao deletar arquivo:', filePath, err.message);
        }
      });
    });

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // todas as inscrições sobrevivem à exclusão do curso, seja qual for
      // o status (não pode sumir com o histórico de quem já pagou,
      // reembolsou, etc.) — guarda o nome do curso nelas antes; curso_id
      // zera sozinho via ON DELETE SET NULL quando o DELETE de cursos rodar
      await client.query(
        `UPDATE inscricoes SET curso_removido_nome = $1, curso_excluido_por = $2 WHERE curso_id = $3`,
        [curso.nome_curso, req.user?.sub ?? null, id]
      );
      await client.query(`DELETE FROM fotos WHERE curso_id = $1`, [id]);
      await client.query(`DELETE FROM cursos WHERE id = $1`, [id]);

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    logAudit({ entityType: 'curso', entityId: id, action: 'excluir', details: curso.nome_curso, userHubId: req.user?.sub });

    res.sendStatus(204);
  } catch (err) {
    console.error(`Erro em ${req.method} ${req.baseUrl}${req.path}:`, err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// erro do multer (arquivo grande demais etc.) ou de algo antes do try
router.use(tratarErroUpload);

module.exports = router;
