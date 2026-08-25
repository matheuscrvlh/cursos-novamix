require('dotenv').config();
const fs = require('fs');
const pool = require('../db');

// Limpeza pontual encontrada numa auditoria completa do schema: FKs
// duplicadas (sobra de scripts anteriores que usaram REFERENCES inline E
// depois um ADD CONSTRAINT nomeado, sem perceber que já existia uma
// equivalente com nome diferente), constraint com nome desatualizado,
// índices faltando em toda coluna de FK (Postgres não cria automático pro
// lado que referencia) e NOT NULL em colunas sempre exigidas pela aplicação
// (conferido: 0 valores nulos hoje em produção antes de aplicar).
async function main() {
  const client = await pool.connect();
  try {
    const backup = {};
    for (const t of ['cursos', 'fotos', 'inscricoes', 'pagamentos', 'culinaristas', 'culinarista_filial', 'industrias', 'banners', 'logs', 'clientes', 'clientes_tokens']) {
      const { rows } = await client.query(`SELECT * FROM cursos.${t}`);
      backup[t] = rows;
    }
    fs.writeFileSync(`./data/backup-antes-limpeza-${Date.now()}.json`, JSON.stringify(backup, null, 2));
    console.log('Backup salvo.');

    await client.query('BEGIN');

    // ---- 1. remove as FKs duplicadas (mantém as com nome no padrão do projeto) ----
    await client.query(`ALTER TABLE cursos.culinarista_filial DROP CONSTRAINT IF EXISTS culinarista_filial_culinarista_id_fkey`);
    await client.query(`ALTER TABLE cursos.culinarista_filial DROP CONSTRAINT IF EXISTS culinarista_filial_filial_id_fkey`);
    await client.query(`ALTER TABLE cursos.logs DROP CONSTRAINT IF EXISTS logs_user_hub_fk`);
    console.log('✓ FKs duplicadas removidas');

    // ---- 2. renomeia constraint com nome desatualizado ----
    await client.query(`ALTER TABLE cursos.pagamentos RENAME CONSTRAINT pagamentos_mp_payment_id_key TO pagamentos_mp_pagamento_id_key`);
    console.log('✓ constraint renomeada pra bater com a coluna atual');

    // ---- 3. índice em toda coluna de FK ----
    const indices = [
      ['cursos', 'culinarista_id'], ['cursos', 'filial_id'],
      ['fotos', 'curso_id'],
      ['inscricoes', 'curso_id'], ['inscricoes', 'cliente_id'],
      ['inscricoes', 'reembolsado_por'], ['inscricoes', 'curso_excluido_por'],
      ['pagamentos', 'inscricao_id'],
      ['culinaristas', 'industria_id'],
      ['culinarista_filial', 'filial_id'],
      ['clientes_tokens', 'cliente_id'],
      ['logs', 'usuario_hub_id'],
    ];
    for (const [tabela, coluna] of indices) {
      await client.query(`CREATE INDEX IF NOT EXISTS idx_${tabela}_${coluna} ON cursos.${tabela} (${coluna})`);
    }
    console.log(`✓ ${indices.length} índices criados`);

    // ---- 4. NOT NULL onde a aplicação sempre exige e hoje não há nulo ----
    const notNulls = [
      ['inscricoes', 'nome'], ['inscricoes', 'cpf'], ['inscricoes', 'celular'],
      ['inscricoes', 'email'], ['inscricoes', 'assento'], ['inscricoes', 'status'],
      ['cursos', 'categoria'], ['cursos', 'duracao'], ['cursos', 'data'],
      ['cursos', 'valor'], ['cursos', 'filial_id'], ['cursos', 'culinarista_id'],
      ['culinaristas', 'nome_culinarista'],
      ['industrias', 'nome'],
    ];
    for (const [tabela, coluna] of notNulls) {
      await client.query(`ALTER TABLE cursos.${tabela} ALTER COLUMN ${coluna} SET NOT NULL`);
    }
    console.log(`✓ ${notNulls.length} colunas marcadas NOT NULL`);

    await client.query('COMMIT');
    console.log('COMMIT ok — limpeza aplicada.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('ERRO — ROLLBACK executado, nada foi alterado:', err);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}
main();
