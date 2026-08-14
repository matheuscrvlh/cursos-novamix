// Script pontual: mescla cursosInfantis em cursos (tipo/capacidade), extrai
// os dados de pagamento de inscricoes pra uma tabela pagamentos própria, e
// remove as tabelas cursosInfantis/inscricoesInfantis (confirmado vazias e
// sem nenhuma referência no frontend). Roda uma vez só, contra o banco
// apontado por DATABASE_URL (mesmo do resto do projeto), dentro de uma
// transação — se qualquer passo falhar, nada é alterado.
//
//   node scripts/migrate-schema-v2.js
//
// Pré-requisito: rodar `node migrate.js` antes, pra garantir que as colunas
// novas (cursos.tipo, cursos.capacidade, tabela pagamentos) já existem.
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const pool = require('./../db');

async function main() {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1) cursos existentes viram tipo='normal', capacidade=24 (era o
    // hardcoded no loop de criação de assento) — o DEFAULT da coluna já
    // cobre isso pra linhas futuras, aqui é só garantir as atuais
    await client.query(`UPDATE cursos.cursos SET tipo = 'normal' WHERE tipo IS NULL`);
    await client.query(`UPDATE cursos.cursos SET capacidade = 24 WHERE capacidade IS NULL`);

    // 2) confirma que cursosInfantis/inscricoesInfantis estão vazias antes
    // de derrubar — aborta a transação inteira se alguém inseriu algo nelas
    // entre a investigação e agora
    const { rows: [{ count: countCursosInfantis }] } = await client.query(
      `SELECT COUNT(*) FROM cursos."cursosInfantis"`
    );
    const { rows: [{ count: countInscricoesInfantis }] } = await client.query(
      `SELECT COUNT(*) FROM cursos."inscricoesInfantis"`
    );
    if (Number(countCursosInfantis) > 0 || Number(countInscricoesInfantis) > 0) {
      throw new Error(
        `cursosInfantis (${countCursosInfantis}) ou inscricoesInfantis (${countInscricoesInfantis}) não estão vazias — abortando, revise antes de rodar de novo.`
      );
    }

    // 3) backfill de pagamentos a partir das inscrições que já tiveram
    // alguma tentativa de pagamento (mp_payment_id preenchido)
    const { rows: inscricoesComPagamento } = await client.query(
      `SELECT id, "metodoPagamento", mp_payment_id, status, "dataInscricao"
       FROM cursos.inscricoes
       WHERE mp_payment_id IS NOT NULL`
    );

    for (const inscricao of inscricoesComPagamento) {
      await client.query(
        `INSERT INTO cursos.pagamentos
           (id, "inscricaoId", "metodoPagamento", mp_payment_id, status, "criadoEm", "atualizadoEm")
         VALUES ($1, $2, $3, $4, $5, $6, $6)
         ON CONFLICT (mp_payment_id) DO NOTHING`,
        [
          uuidv4(),
          inscricao.id,
          inscricao.metodoPagamento,
          inscricao.mp_payment_id,
          inscricao.status,
          inscricao.dataInscricao,
        ]
      );
    }
    console.log(`pagamentos: ${inscricoesComPagamento.length} linhas migradas de inscricoes`);

    // 4) as colunas de pagamento saem de inscricoes — os dados já estão
    // preservados em pagamentos (passo 3) e mp_preference_id nunca foi
    // escrito por nenhuma rota (confirmado por grep), então não perde nada
    await client.query(`
      ALTER TABLE cursos.inscricoes
        DROP COLUMN IF EXISTS "formaPagamento",
        DROP COLUMN IF EXISTS mp_preference_id,
        DROP COLUMN IF EXISTS mp_payment_id,
        DROP COLUMN IF EXISTS "metodoPagamento"
    `);
    console.log('cursos.inscricoes: colunas de pagamento removidas');

    // 5) tabelas mortas — cursosInfantis nunca teve linha em produção
    // (curso infantil sempre foi criado em `cursos`... na verdade não, mas
    // não tinha curso infantil cadastrado ainda) e inscricoesInfantis nunca
    // foi usada pelo frontend (o fluxo de inscrição infantil sempre usou a
    // tabela `inscricoes` genérica)
    await client.query(`DROP TABLE cursos."cursosInfantis"`);
    await client.query(`DROP TABLE cursos."inscricoesInfantis"`);
    console.log('cursosInfantis e inscricoesInfantis removidas');

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  console.log('\nConferência final:');
  const cursos = await pool.query(`SELECT COUNT(*) FROM cursos.cursos`);
  const inscricoes = await pool.query(`SELECT COUNT(*) FROM cursos.inscricoes`);
  const pagamentos = await pool.query(`SELECT COUNT(*) FROM cursos.pagamentos`);
  console.log(`  cursos: ${cursos.rows[0].count}`);
  console.log(`  inscricoes: ${inscricoes.rows[0].count}`);
  console.log(`  pagamentos: ${pagamentos.rows[0].count}`);
}

main()
  .then(() => {
    console.log('\nMigração de schema (v2) concluída.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Erro na migração de schema (v2):', err);
    process.exit(1);
  });
