require('dotenv').config();
const pool = require('../db');

// Loja preferida vira uma pergunta do cadastro (em vez do popup de primeira
// visita salvo em localStorage) — precisa de uma coluna em clientes pra
// guardar isso. Segue o mesmo padrão de cursos/culinaristas: FK pra
// public.branchs, resolvida a partir do texto "Prado"/"Teresopolis" que o
// frontend já manda.
async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`ALTER TABLE cursos.clientes ADD COLUMN IF NOT EXISTS filial_id INTEGER REFERENCES public.branchs(id)`);
    console.log('✓ coluna clientes.filial_id criada');

    await client.query(`CREATE INDEX IF NOT EXISTS idx_clientes_filial_id ON cursos.clientes (filial_id)`);
    console.log('✓ índice criado');

    await client.query('COMMIT');
    console.log('COMMIT ok.');
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
