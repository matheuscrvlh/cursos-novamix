require('dotenv').config();
const fs = require('fs');
const pool = require('../db');

// Migração pontual (uma vez só, roda direto neste script — não é o migrate.js
// idempotente de boot). Normaliza o schema mais a fundo:
//   - cursos.assentos sai (status de assento passa a viver 100% em
//     cursos.inscricoes, via o índice único parcial já criado antes)
//   - cursos.cursos: culinarista (nome-texto) sai, fica só culinarista_id;
//     data+hora viram uma coluna "data" (TIMESTAMP); loja vira filial_id
//     (FK pra public.branchs); ativo vira status; ganha criado_em
//   - cursos.inscricoes: curso_id ganha FK real pra cursos.cursos
//     (ON DELETE SET NULL — inscrição continua existindo, só perde o
//     vínculo; curso_removido_nome/curso_excluido_por continuam guardando
//     o registro histórico)
//   - cursos.pagamentos: mp_payment_id -> mp_pagamento_id; ganha
//     comprovante_url (preenchido pelo backend depois, com o link que o MP
//     retorna)
//   - cursos.culinaristas: industria (texto) vira industria_id (FK pra
//     cursos.industrias); lojas (JSONB) vira tabela de junção
//     culinarista_filial (FK pra public.branchs, N:N); data_cadastro vira
//     criado_em
//   - cursos.industrias: data_cadastro vira criado_em
//   - cursos.logs: colunas em inglês traduzidas (entity_type -> tipo_entidade,
//     entity_id -> entidade_id, action -> acao, details -> detalhes,
//     user_hub_id -> usuario_hub_id, created_at -> criado_em)
async function main() {
  const client = await pool.connect();
  try {
    const backup = {};
    for (const t of ['cursos', 'assentos', 'fotos', 'inscricoes', 'pagamentos', 'culinaristas', 'industrias', 'banners', 'logs']) {
      const { rows } = await client.query(`SELECT * FROM cursos.${t}`);
      backup[t] = rows;
    }
    const backupPath = `./data/backup-antes-normalizacao-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`Backup salvo em ${backupPath}`);

    await client.query('BEGIN');

    // ---- assentos sai ----
    await client.query(`DROP TABLE IF EXISTS cursos.assentos`);
    console.log('✓ cursos.assentos removida (status do assento agora é derivado de cursos.inscricoes)');

    // ---- cursos.cursos ----
    await client.query(`ALTER TABLE cursos.cursos DROP COLUMN IF EXISTS culinarista`);

    // data (DATE) + hora (TIME) -> data (TIMESTAMP, sem timezone: é um
    // horário local fixo do evento, não um instante universal)
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN data TYPE TIMESTAMP USING (data + hora)`);
    await client.query(`ALTER TABLE cursos.cursos DROP COLUMN IF EXISTS hora`);

    // loja (texto solto "Prado"/"Teresopolis") -> filial_id (FK real pra
    // public.branchs, a mesma tabela de filiais usada pelo hub-novamix)
    await client.query(`ALTER TABLE cursos.cursos ADD COLUMN IF NOT EXISTS filial_id INTEGER`);
    await client.query(`
      UPDATE cursos.cursos SET filial_id = CASE
        WHEN loja = 'Prado' THEN 1
        WHEN loja = 'Teresopolis' THEN 4
      END
      WHERE filial_id IS NULL
    `);
    await client.query(`ALTER TABLE cursos.cursos ADD CONSTRAINT cursos_filial_fk FOREIGN KEY (filial_id) REFERENCES public.branchs(id)`);
    await client.query(`ALTER TABLE cursos.cursos DROP COLUMN IF EXISTS loja`);

    await client.query(`ALTER TABLE cursos.cursos RENAME COLUMN ativo TO status`);

    await client.query(`ALTER TABLE cursos.cursos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMPTZ DEFAULT now()`);
    console.log('✓ cursos.cursos normalizada (culinarista_id, data unificada, filial_id, status, criado_em)');

    // ---- cursos.inscricoes: curso_id ganha FK de verdade ----
    // ON DELETE SET NULL preserva a inscrição (e o histórico de pagamento)
    // mesmo depois do curso ser excluído — curso_removido_nome/
    // curso_excluido_por continuam guardando esse registro, então NÃO
    // colapsei isso pra dentro de status: um "pago" que virou órfão continua
    // sendo importante saber que era "pago", coisa que um status genérico
    // "removido" perderia.
    await client.query(`ALTER TABLE cursos.inscricoes ALTER COLUMN curso_id DROP NOT NULL`);
    // cursos já excluídos antes desta FK existir deixaram curso_id órfão
    // (apontando pra um id que não existe mais) — zera esses aqui, é
    // exatamente o que ON DELETE SET NULL já teria feito na hora
    const orfaos = await client.query(`
      UPDATE cursos.inscricoes i SET curso_id = NULL
      WHERE i.curso_id IS NOT NULL
        AND NOT EXISTS (SELECT 1 FROM cursos.cursos c WHERE c.id = i.curso_id)
    `);
    console.log(`✓ ${orfaos.rowCount} inscrições órfãs (curso já excluído) tiveram curso_id zerado`);
    await client.query(`ALTER TABLE cursos.inscricoes ADD CONSTRAINT inscricoes_curso_fk FOREIGN KEY (curso_id) REFERENCES cursos.cursos(id) ON DELETE SET NULL`);
    console.log('✓ cursos.inscricoes.curso_id agora referencia cursos.cursos (ON DELETE SET NULL)');

    // ---- cursos.pagamentos ----
    await client.query(`ALTER TABLE cursos.pagamentos RENAME COLUMN mp_payment_id TO mp_pagamento_id`);
    await client.query(`ALTER TABLE cursos.pagamentos ADD COLUMN IF NOT EXISTS comprovante_url VARCHAR(500)`);
    console.log('✓ cursos.pagamentos.mp_pagamento_id + comprovante_url (a preencher pelo backend)');

    // ---- cursos.culinaristas ----
    await client.query(`ALTER TABLE cursos.culinaristas ADD COLUMN IF NOT EXISTS industria_id UUID`);
    // "industria" hoje está vazia em toda linha de produção — nada pra
    // casar/perder no backfill, é seguro só trocar a coluna
    await client.query(`ALTER TABLE cursos.culinaristas ADD CONSTRAINT culinaristas_industria_fk FOREIGN KEY (industria_id) REFERENCES cursos.industrias(id) ON DELETE SET NULL`);
    await client.query(`ALTER TABLE cursos.culinaristas DROP COLUMN IF EXISTS industria`);

    // lojas (JSONB, N filiais por culinarista) -> tabela de junção com FK
    // real pra public.branchs (um array não dá pra ter FK por elemento)
    await client.query(`
      CREATE TABLE IF NOT EXISTS cursos.culinarista_filial (
        culinarista_id UUID NOT NULL REFERENCES cursos.culinaristas(id) ON DELETE CASCADE,
        filial_id      INTEGER NOT NULL REFERENCES public.branchs(id),
        PRIMARY KEY (culinarista_id, filial_id)
      )
    `);
    const { rows: culinaristasComLojas } = await client.query(`SELECT id, lojas FROM cursos.culinaristas WHERE lojas IS NOT NULL`);
    const mapaFilial = { Prado: 1, Teresopolis: 4 };
    let vinculosCriados = 0;
    for (const c of culinaristasComLojas) {
      const nomesLojas = Array.isArray(c.lojas) ? c.lojas : [];
      for (const nomeLoja of nomesLojas) {
        const filialId = mapaFilial[nomeLoja];
        if (!filialId) continue;
        await client.query(
          `INSERT INTO cursos.culinarista_filial (culinarista_id, filial_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [c.id, filialId]
        );
        vinculosCriados++;
      }
    }
    await client.query(`ALTER TABLE cursos.culinaristas DROP COLUMN IF EXISTS lojas`);
    console.log(`✓ cursos.culinarista_filial criada (${vinculosCriados} vínculos migrados de lojas)`);

    await client.query(`ALTER TABLE cursos.culinaristas RENAME COLUMN data_cadastro TO criado_em`);
    console.log('✓ cursos.culinaristas normalizada (industria_id, culinarista_filial, criado_em)');

    // ---- cursos.industrias ----
    await client.query(`ALTER TABLE cursos.industrias RENAME COLUMN data_cadastro TO criado_em`);
    console.log('✓ cursos.industrias.criado_em');

    // ---- cursos.logs: traduz colunas em inglês ----
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "entity_type" TO tipo_entidade`);
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "entity_id" TO entidade_id`);
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "action" TO acao`);
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "details" TO detalhes`);
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "user_hub_id" TO usuario_hub_id`);
    await client.query(`ALTER TABLE cursos.logs RENAME COLUMN "created_at" TO criado_em`);
    console.log('✓ cursos.logs traduzida para português');

    await client.query('COMMIT');
    console.log('COMMIT ok — schema normalizado.');
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
