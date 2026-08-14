const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL não configurado — defina no .env antes de subir o servidor');
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Supabase exige SSL; o certificado é assinado por uma CA que o Node não
    // reconhece por padrão, então desativamos a validação da cadeia (mesma
    // abordagem recomendada pela própria Supabase pra conexões via pooler)
    ssl: { rejectUnauthorized: false },
    // Todas as tabelas do projeto vivem no schema `cursos`, não no `public`
    // padrão — sem isso, toda query nas rotas (que usa nomes sem prefixo, tipo
    // `FROM inscricoes`) cairia no schema errado. Setado via parâmetro de
    // startup da conexão (equivalente a `SET search_path` rodado antes de
    // qualquer query), em vez do evento 'connect' do pool — o pool não espera
    // esse evento terminar antes de liberar o client pra próxima query, o que
    // causava corrida com a primeira query real de cada conexão nova.
    options: '-c search_path=cursos,public',
});

pool.on('error', err => {
    console.error('Erro inesperado no pool do Postgres:', err);
});

pool.connect()
    .then(client => {
        client.release();
        console.log('Postgres conectado 🚀');
    })
    .catch(err => console.error('Erro ao conectar no banco', err));

module.exports = pool;
