const express = require('express');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const createUpload = require('../config/createUpload');
const { authenticate, requireCursosAccess, requireCursosAdmin } = require('../middleware/auth.middleware');
const pool = require('../db');
const logAudit = require('../utils/logAudit');
const { encryptCpf, decryptCpf } = require('../utils/cpfCrypto');

const uploadCulinaristas = createUpload('culinaristas');
const router = express.Router();

// industria_id é a fonte da verdade; a rota aceita/retorna o NOME (contrato
// que o frontend já usa) e resolve pro id por trás.
async function resolverIndustriaId(nomeIndustria) {
  if (!nomeIndustria) return null;
  const { rows } = await pool.query(`SELECT id FROM industrias WHERE nome = $1`, [nomeIndustria]);
  return rows[0]?.id ?? null;
}

async function resolverFilialId(client, nomeLoja) {
  const { rows } = await client.query(
    `SELECT id FROM public.branchs WHERE name ILIKE '%' || $1 || '%' LIMIT 1`,
    [nomeLoja]
  );
  return rows[0]?.id ?? null;
}

// substitui os vínculos de filial (culinarista_filial) pela lista de nomes
// de loja recebida — mesmo contrato de sempre (array de strings tipo
// ["Prado","Teresopolis"]), só a forma de guardar isso mudou pra uma tabela
// de junção com FK real em vez de JSONB solto
async function salvarFiliais(client, culinaristaId, nomesLoja) {
  await client.query(`DELETE FROM culinarista_filial WHERE culinarista_id = $1`, [culinaristaId]);
  for (const nome of nomesLoja) {
    const filialId = await resolverFilialId(client, nome);
    if (!filialId) continue;
    await client.query(
      `INSERT INTO culinarista_filial (culinarista_id, filial_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [culinaristaId, filialId]
    );
  }
}

// select comum: nome_culinarista/industria/lojas no formato que o frontend
// já espera (nomeCulinarista, industria como nome, lojas como array de nomes)
const SELECT_CULINARISTA = `
  SELECT
    c.id,
    c.nome_culinarista AS "nomeCulinarista",
    c.cpf,
    c.industria_id AS "industriaId",
    i.nome AS industria,
    c.telefone,
    c.instagram,
    c.cursos,
    c.foto,
    c.criado_em AS "dataCadastro",
    COALESCE(
      (SELECT jsonb_agg(REPLACE(b.name, 'Novamix ', ''))
       FROM culinarista_filial cf
       JOIN public.branchs b ON b.id = cf.filial_id
       WHERE cf.culinarista_id = c.id),
      '[]'::jsonb
    ) AS lojas
  FROM culinaristas c
  LEFT JOIN industrias i ON i.id = c.industria_id
`;

// lista é pequena (uma linha por culinarista cadastrada) e o front busca uma
// vez só e cacheia — busca por nome existe aqui pra ficar no mesmo padrão dos
// outros GETs que filtram no SQL, não porque o dataset precise disso hoje
router.get('/', async (req, res) => {
  try {
    const { busca } = req.query;
    const where = busca ? `WHERE c.nome_culinarista ILIKE $1` : '';
    const { rows } = await pool.query(`${SELECT_CULINARISTA} ${where}`, busca ? [`%${busca}%`] : []);
    // cpf vem cifrado do banco (ver utils/cpfCrypto.js) — decifra na borda de saída
    res.json(rows.map(r => ({ ...r, cpf: decryptCpf(r.cpf) })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticate, requireCursosAccess, uploadCulinaristas.single('foto'), async (req, res) => {
  const { nomeCulinarista, cpf, lojas, cursos, instagram, industria, telefone } = req.body;

  if (!nomeCulinarista || !cpf) {
    return res.status(400).json({ message: 'Nome e CPF são obrigatórios' });
  }

  const id = uuidv4();
  const foto = req.file ? `/uploads/culinaristas/${req.file.filename}` : null;
  const lojasArray = lojas ? JSON.parse(lojas) : [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const industriaId = await resolverIndustriaId(industria);

    await client.query(`
      INSERT INTO culinaristas
        (id, nome_culinarista, cpf, industria_id, telefone, instagram, cursos, foto)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      id,
      nomeCulinarista,
      encryptCpf(cpf),
      industriaId,
      telefone,
      instagram,
      cursos ? cursos : JSON.stringify([]),
      foto,
    ]);

    await salvarFiliais(client, id, lojasArray);

    await client.query('COMMIT');
    res.status(201).json({ id, nomeCulinarista, cpf, industria, telefone, lojas: lojasArray, instagram, foto });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao inserir culinarista:', err);
    res.status(500).json({ message: 'Erro ao criar culinarista' });
  } finally {
    client.release();
  }
});

router.put('/:id', authenticate, requireCursosAccess, uploadCulinaristas.single('foto'), async (req, res) => {
  const { id } = req.params;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows } = await client.query(`SELECT * FROM culinaristas WHERE id = $1`, [id]);
    if (!rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Culinarista não encontrado' });
    }
    const culinarista = rows[0];

    if (req.file && culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    const novaFoto = req.file
      ? `/uploads/culinaristas/${req.file.filename}`
      : culinarista.foto;

    const industriaInformada = req.body.industria !== undefined;
    const novaIndustriaId = industriaInformada ? await resolverIndustriaId(req.body.industria) : null;

    await client.query(`
      UPDATE culinaristas SET
        nome_culinarista = COALESCE($1, nome_culinarista),
        cpf              = COALESCE($2, cpf),
        instagram        = COALESCE($3, instagram),
        telefone         = COALESCE($4, telefone),
        industria_id     = CASE WHEN $5 THEN $6 ELSE industria_id END,
        cursos           = COALESCE($7, cursos),
        foto             = $8
      WHERE id = $9
    `, [
      req.body.nomeCulinarista ?? null,
      req.body.cpf ? encryptCpf(req.body.cpf) : null,
      req.body.instagram ?? null,
      req.body.telefone ?? null,
      industriaInformada,
      novaIndustriaId,
      req.body.cursos ?? null,
      novaFoto,
      id
    ]);

    if (req.body.lojas !== undefined) {
      await salvarFiliais(client, id, JSON.parse(req.body.lojas));
    }

    await client.query('COMMIT');
    res.json({ message: 'Atualizado' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao atualizar culinarista:', err);
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.delete('/:id', authenticate, requireCursosAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const { rows } = await pool.query(`SELECT * FROM culinaristas WHERE id = $1`, [id]);
    if (!rows.length) return res.status(404).json({ message: 'Culinarista não encontrado' });
    const culinarista = rows[0];

    // curso.culinarista_id é obrigatório (NOT NULL) — não dá pra excluir uma
    // culinarista com curso vinculado sem deixar esses cursos sem dono
    const { rows: cursosVinculados } = await pool.query(
      `SELECT nome_curso FROM cursos WHERE culinarista_id = $1 LIMIT 1`,
      [id]
    );
    if (cursosVinculados.length) {
      return res.status(400).json({
        message: `Não é possível excluir: existe pelo menos um curso vinculado a essa culinarista ("${cursosVinculados[0].nome_curso}"). Troque a culinarista desses cursos antes de excluir.`
      });
    }

    if (culinarista.foto) {
      const fotoPath = path.join(__dirname, '..', culinarista.foto);
      if (fs.existsSync(fotoPath)) fs.unlinkSync(fotoPath);
    }

    await pool.query(`DELETE FROM culinaristas WHERE id = $1`, [id]);

    logAudit({ entityType: 'culinarista', entityId: id, action: 'excluir', details: culinarista.nome_culinarista, userHubId: req.user?.sub });

    res.sendStatus(204);
  } catch (err) {
    console.error('Erro ao deletar culinarista:', err);
    res.status(500).json({ error: err.message });
  }
});

// Handler de erro do Multer
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message });
  next();
});

module.exports = router;
