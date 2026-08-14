FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

# --omit=dev deixa de fora o sqlite3 (devDependency, só usado pelo script
# pontual de migração de dados, rodado localmente fora do container) — como
# ele tem binding nativo, isso também evita precisar de python3/make/g++
# aqui, que a troca pra `pg` (pacote puro JS) já tornou desnecessários
RUN npm install --omit=dev

COPY . .

EXPOSE 3000

CMD ["sh", "-c", "node migrate.js && node server.js"]
