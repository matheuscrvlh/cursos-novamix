require('dotenv').config();
const fs = require('fs');
const pool = require('../db');
const { encryptCpf } = require('../utils/cpfCrypto');

// CPF passa a ser cifrado em repouso (AES-256-GCM determinístico, ver
// utils/cpfCrypto.js) nas três tabelas que hoje guardam o valor em texto
// puro — clientes (conta/checkout), inscricoes (guest checkout sem conta +
// snapshot histórico que sobrevive à exclusão da conta, ver
// inscricoes_cliente_fk ON DELETE SET NULL) e culinaristas (cadastro do
// admin). VARCHAR(14) não cabe mais o valor cifrado (~52 chars em base64:
// 12 bytes de IV + 16 de auth tag + o CPF cifrado), então a coluna também
// precisa virar TEXT.
async function main() {
  if (!process.env.CPF_ENCRYPTION_KEY) {
    console.error('CPF_ENCRYPTION_KEY não configurado — defina no .env antes de rodar essa migração');
    process.exitCode = 1;
    return;
  }

  const client = await pool.connect();
  try {
    const backup = {};
    for (const t of ['clientes', 'inscricoes', 'culinaristas']) {
      const { rows } = await client.query(`SELECT id, cpf FROM cursos.${t}`);
      backup[t] = rows;
    }
    fs.writeFileSync(`./data/backup-antes-cpf-cifrado-${Date.now()}.json`, JSON.stringify(backup, null, 2));
    console.log('Backup salvo (CPF em texto puro, antes de cifrar).');

    await client.query('BEGIN');

    await client.query(`ALTER TABLE cursos.clientes ALTER COLUMN cpf TYPE TEXT`);
    await client.query(`ALTER TABLE cursos.culinaristas ALTER COLUMN cpf TYPE TEXT`);
    await client.query(`ALTER TABLE cursos.inscricoes ALTER COLUMN cpf TYPE TEXT`);
    console.log('✓ colunas cpf ampliadas pra TEXT');

    for (const t of ['clientes', 'inscricoes', 'culinaristas']) {
      const { rows } = await client.query(`SELECT id, cpf FROM cursos.${t} WHERE cpf IS NOT NULL`);
      for (const row of rows) {
        await client.query(`UPDATE cursos.${t} SET cpf = $1 WHERE id = $2`, [encryptCpf(row.cpf), row.id]);
      }
      console.log(`✓ ${rows.length} CPF(s) cifrados em cursos.${t}`);
    }

    await client.query('COMMIT');
    console.log('COMMIT ok — CPFs cifrados em repouso.');
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
