require('dotenv').config();
const db = require('./db');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS culinaristas (
      id             TEXT PRIMARY KEY,
      nomeCulinarista TEXT,
      cpf            TEXT,
      industria      TEXT,
      telefone       TEXT,
      instagram      TEXT,
      lojas          TEXT,
      cursos         TEXT,
      foto           TEXT,
      dataCadastro   TEXT
    )
  `, err => { if (err) console.error('culinaristas:', err); else console.log('✓ culinaristas'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS industrias (
      id           TEXT PRIMARY KEY,
      razaoSocial  TEXT,
      nome         TEXT,
      cnpj         TEXT,
      telefone     TEXT,
      email        TEXT,
      endereco     TEXT,
      instagram    TEXT,
      site         TEXT,
      foto         TEXT,
      dataCadastro TEXT
    )
  `, err => { if (err) console.error('industrias:', err); else console.log('✓ industrias'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS cursosInfantis (
      id              TEXT PRIMARY KEY,
      nomeCurso       TEXT,
      tipo            TEXT,
      culinarista     TEXT,
      categoria       TEXT,
      duracao         TEXT,
      data            TEXT,
      hora            TEXT,
      loja            TEXT,
      valor           REAL,
      nomeResponsavel TEXT,
      nomeAluno       TEXT,
      modalidade      TEXT
    )
  `, err => { if (err) console.error('cursosInfantis:', err); else console.log('✓ cursosInfantis'); });

  db.run(`
    CREATE TABLE IF NOT EXISTS inscricoesInfantis (
      id              TEXT PRIMARY KEY,
      cursoId         TEXT,
      nomeResponsavel TEXT,
      telefone        TEXT,
      nomeCrianca     TEXT,
      idadeCrianca    TEXT,
      cpf             TEXT,
      formaPagamento  TEXT,
      status          TEXT,
      dataInscricao   TEXT
    )
  `, err => { if (err) console.error('inscricoesInfantis:', err); else console.log('✓ inscricoesInfantis'); });

  // ALTER TABLE seguro: ignora erro se coluna já existir
  db.run('ALTER TABLE inscricoes ADD COLUMN mp_preference_id TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('mp_preference_id:', err);
    else console.log('✓ inscricoes.mp_preference_id');
  });
  db.run('ALTER TABLE inscricoes ADD COLUMN mp_payment_id TEXT', err => {
    if (err && !err.message.includes('duplicate column')) console.error('mp_payment_id:', err);
    else console.log('✓ inscricoes.mp_payment_id');
  });

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id           TEXT PRIMARY KEY,
      usuario      TEXT UNIQUE NOT NULL,
      senha        TEXT NOT NULL,
      dataCadastro TEXT
    )
  `, async (err) => {
    if (err) { console.error('usuarios:', err); return; }
    console.log('✓ usuarios');

    // Seed: cria admin padrão se não existir nenhum usuário
    db.get('SELECT COUNT(*) as total FROM usuarios', [], async (err2, row) => {
      if (err2 || row.total > 0) return;
      const hash = await bcrypt.hash(process.env.ADMIN_SEED_SENHA || 'changeme', 12);
      db.run(
        'INSERT INTO usuarios (id, usuario, senha, dataCadastro) VALUES (?, ?, ?, ?)',
        [uuidv4(), 'admin', hash, new Date().toISOString()],
        (err3) => {
          if (err3) console.error('seed admin:', err3);
          else console.log('✓ usuário admin criado (senha: admin123)');
        }
      );
    });
  });
});

setTimeout(() => { db.close(); console.log('Migração concluída.'); }, 1500);
