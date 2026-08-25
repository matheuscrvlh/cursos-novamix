require('dotenv').config();
const fs = require('fs');
const pool = require('../db');

// Migração pontual (roda uma vez, igual migrate-schema-v2.js): renomeia toda
// coluna camelCase pra snake_case e troca os tipos de TEXT genérico pro tipo
// exato (UUID, VARCHAR(n), DATE, TIME, NUMERIC, BOOLEAN, TIMESTAMPTZ, JSONB).
// Depois desta migração, o CÓDIGO do backend (server/routes/*, server/migrate.js)
// ainda referencia os nomes antigos — isso é esperado, o banco passa a ser a
// fonte da verdade e o backend é atualizado numa etapa seguinte.
async function main() {
  const client = await pool.connect();
  try {
    // backup de segurança antes de qualquer coisa
    const backup = {};
    for (const t of ['cursos', 'fotos', 'assentos', 'inscricoes', 'pagamentos', 'culinaristas', 'industrias', 'banners', 'logs']) {
      const { rows } = await client.query(`SELECT * FROM cursos.${t}`);
      backup[t] = rows;
    }
    const backupPath = `./data/backup-antes-tipagem-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`Backup salvo em ${backupPath}`);

    await client.query('BEGIN');

    // ---- 1. renomeia colunas camelCase -> snake_case ----
    const renomeios = [
      ['cursos', 'nomeCurso', 'nome_curso'],
      ['cursos', 'culinaristaId', 'culinarista_id'],
      ['assentos', 'cursoId', 'curso_id'],
      ['fotos', 'cursoId', 'curso_id'],
      ['inscricoes', 'cursoId', 'curso_id'],
      ['inscricoes', 'dataInscricao', 'data_inscricao'],
      ['inscricoes', 'cursoRemovidoNome', 'curso_removido_nome'],
      ['inscricoes', 'reembolsadoPor', 'reembolsado_por'],
      ['inscricoes', 'cursoExcluidoPor', 'curso_excluido_por'],
      ['pagamentos', 'inscricaoId', 'inscricao_id'],
      ['pagamentos', 'metodoPagamento', 'metodo_pagamento'],
      ['pagamentos', 'criadoEm', 'criado_em'],
      ['pagamentos', 'atualizadoEm', 'atualizado_em'],
      ['culinaristas', 'nomeCulinarista', 'nome_culinarista'],
      ['culinaristas', 'dataCadastro', 'data_cadastro'],
      ['industrias', 'razaoSocial', 'razao_social'],
      ['industrias', 'dataCadastro', 'data_cadastro'],
      ['logs', 'entityType', 'entity_type'],
      ['logs', 'entityId', 'entity_id'],
      ['logs', 'userHubId', 'user_hub_id'],
      ['logs', 'createdAt', 'created_at'],
    ];
    for (const [tabela, de, para] of renomeios) {
      await client.query(`ALTER TABLE cursos.${tabela} RENAME COLUMN "${de}" TO "${para}"`);
    }
    console.log(`✓ ${renomeios.length} colunas renomeadas para snake_case`);

    // ---- 2. dropa as FKs cujo tipo da coluna vai mudar (TEXT -> UUID) ----
    await client.query(`ALTER TABLE cursos.assentos DROP CONSTRAINT IF EXISTS assentos_curso_fk`);
    await client.query(`ALTER TABLE cursos.fotos DROP CONSTRAINT IF EXISTS fotos_curso_fk`);
    await client.query(`ALTER TABLE cursos.pagamentos DROP CONSTRAINT IF EXISTS pagamentos_inscricao_fk`);
    await client.query(`ALTER TABLE cursos.cursos DROP CONSTRAINT IF EXISTS cursos_culinarista_fk`);
    console.log('✓ FKs antigas removidas (serão recriadas com os novos tipos)');

    // ---- 3. ids/FKs de UUID: eram TEXT guardando uuidv4(), agora UUID nativo ----
    const paraUuid = [
      ['cursos', 'id'], ['cursos', 'culinarista_id'],
      ['assentos', 'curso_id'],
      ['fotos', 'curso_id'],
      ['inscricoes', 'id'], ['inscricoes', 'curso_id'],
      ['pagamentos', 'id'], ['pagamentos', 'inscricao_id'],
      ['culinaristas', 'id'],
      ['industrias', 'id'],
      ['banners', 'id'],
    ];
    for (const [tabela, coluna] of paraUuid) {
      await client.query(`ALTER TABLE cursos.${tabela} ALTER COLUMN "${coluna}" TYPE UUID USING "${coluna}"::uuid`);
    }
    console.log(`✓ ${paraUuid.length} colunas convertidas para UUID`);

    // ---- 4. demais tipos exatos ----
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN data TYPE DATE USING data::date`);
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN hora TYPE TIME USING hora::time`);
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN valor TYPE NUMERIC(10,2) USING valor::numeric(10,2)`);
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN ativo DROP DEFAULT`);
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN ativo TYPE BOOLEAN USING ativo::boolean`);
    await client.query(`ALTER TABLE cursos.cursos ALTER COLUMN ativo SET DEFAULT true`);

    await client.query(`ALTER TABLE cursos.banners ALTER COLUMN ativo DROP DEFAULT`);
    await client.query(`ALTER TABLE cursos.banners ALTER COLUMN ativo TYPE BOOLEAN USING ativo::text::boolean`);
    await client.query(`ALTER TABLE cursos.banners ALTER COLUMN ativo SET DEFAULT true`);

    await client.query(`ALTER TABLE cursos.inscricoes ALTER COLUMN data_inscricao TYPE TIMESTAMPTZ USING data_inscricao::timestamptz`);
    await client.query(`ALTER TABLE cursos.inscricoes ALTER COLUMN data_inscricao SET DEFAULT now()`);

    await client.query(`ALTER TABLE cursos.pagamentos ALTER COLUMN criado_em TYPE TIMESTAMPTZ USING criado_em::timestamptz`);
    await client.query(`ALTER TABLE cursos.pagamentos ALTER COLUMN criado_em SET DEFAULT now()`);
    await client.query(`ALTER TABLE cursos.pagamentos ALTER COLUMN atualizado_em TYPE TIMESTAMPTZ USING atualizado_em::timestamptz`);

    await client.query(`ALTER TABLE cursos.culinaristas ALTER COLUMN data_cadastro TYPE TIMESTAMPTZ USING data_cadastro::timestamptz`);
    await client.query(`ALTER TABLE cursos.culinaristas ALTER COLUMN data_cadastro SET DEFAULT now()`);
    await client.query(`ALTER TABLE cursos.culinaristas ALTER COLUMN lojas TYPE JSONB USING lojas::jsonb`);
    await client.query(`ALTER TABLE cursos.culinaristas ALTER COLUMN cursos TYPE JSONB USING cursos::jsonb`);

    await client.query(`ALTER TABLE cursos.industrias ALTER COLUMN data_cadastro TYPE TIMESTAMPTZ USING data_cadastro::timestamptz`);
    await client.query(`ALTER TABLE cursos.industrias ALTER COLUMN data_cadastro SET DEFAULT now()`);
    console.log('✓ DATE/TIME/NUMERIC/BOOLEAN/TIMESTAMPTZ/JSONB aplicados');

    // VARCHAR(n) nos textos curtos — tamanho com folga sobre o maior valor
    // real hoje em produção (conferido antes de escrever esta migração)
    const paraVarchar = [
      ['cursos', 'nome_curso', 255], ['cursos', 'tipo', 20], ['cursos', 'categoria', 100],
      ['cursos', 'duracao', 50], ['cursos', 'loja', 100], ['cursos', 'culinarista', 255],
      ['assentos', 'status', 20],
      ['fotos', 'url', 255],
      ['inscricoes', 'nome', 255], ['inscricoes', 'cpf', 14], ['inscricoes', 'celular', 20],
      ['inscricoes', 'email', 255], ['inscricoes', 'status', 20], ['inscricoes', 'curso_removido_nome', 255],
      ['pagamentos', 'metodo_pagamento', 20], ['pagamentos', 'mp_payment_id', 50], ['pagamentos', 'status', 20],
      ['culinaristas', 'nome_culinarista', 255], ['culinaristas', 'cpf', 14], ['culinaristas', 'industria', 255],
      ['culinaristas', 'telefone', 20], ['culinaristas', 'instagram', 100], ['culinaristas', 'foto', 255],
      ['industrias', 'razao_social', 255], ['industrias', 'nome', 255], ['industrias', 'cnpj', 18],
      ['industrias', 'telefone', 20], ['industrias', 'email', 255], ['industrias', 'endereco', 500],
      ['industrias', 'instagram', 100], ['industrias', 'site', 255], ['industrias', 'foto', 255],
      ['banners', 'posicao', 20], ['banners', 'imagem', 255], ['banners', 'imagem_mobile', 255], ['banners', 'link', 500],
      ['logs', 'entity_type', 50], ['logs', 'entity_id', 100], ['logs', 'action', 50],
    ];
    for (const [tabela, coluna, tamanho] of paraVarchar) {
      await client.query(`ALTER TABLE cursos.${tabela} ALTER COLUMN "${coluna}" TYPE VARCHAR(${tamanho})`);
    }
    console.log(`✓ ${paraVarchar.length} colunas convertidas para VARCHAR`);

    // ---- 5. recria as FKs derrubadas no passo 2, agora com tipos batendo ----
    await client.query(`ALTER TABLE cursos.assentos ADD CONSTRAINT assentos_curso_fk FOREIGN KEY (curso_id) REFERENCES cursos.cursos(id) ON DELETE CASCADE`);
    await client.query(`ALTER TABLE cursos.fotos ADD CONSTRAINT fotos_curso_fk FOREIGN KEY (curso_id) REFERENCES cursos.cursos(id) ON DELETE CASCADE`);
    await client.query(`ALTER TABLE cursos.pagamentos ADD CONSTRAINT pagamentos_inscricao_fk FOREIGN KEY (inscricao_id) REFERENCES cursos.inscricoes(id) ON DELETE CASCADE`);
    await client.query(`ALTER TABLE cursos.cursos ADD CONSTRAINT cursos_culinarista_fk FOREIGN KEY (culinarista_id) REFERENCES cursos.culinaristas(id) ON DELETE SET NULL`);

    // upgrade: reembolsado_por/curso_excluido_por eram só INTEGER solto (sem FK
    // hard-enforced); agora que já validamos leitura+FK em public.users (ver
    // cursos.logs.user_hub_id), colocamos a mesma referência real aqui
    await client.query(`ALTER TABLE cursos.inscricoes ADD CONSTRAINT inscricoes_reembolsado_por_fk FOREIGN KEY (reembolsado_por) REFERENCES public.users(id)`);
    await client.query(`ALTER TABLE cursos.inscricoes ADD CONSTRAINT inscricoes_excluido_por_fk FOREIGN KEY (curso_excluido_por) REFERENCES public.users(id)`);
    console.log('✓ FKs recriadas (+ 2 novas pra public.users)');

    await client.query('COMMIT');
    console.log('COMMIT ok — schema tipado e em snake_case.');
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
