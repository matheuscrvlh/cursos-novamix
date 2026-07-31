const LOJA_KEY = 'loja'
const EXPIRACAO_MS = 2 * 24 * 60 * 60 * 1000 // 2 dias

// Lê a loja salva, mas descarta (e limpa) se já passou da validade — evita
// prender o cliente pra sempre no mesmo filtro de loja
export function getLojaStorage() {
    const raw = localStorage.getItem(LOJA_KEY)
    if (!raw) return null

    try {
        const { valor, expiraEm } = JSON.parse(raw)
        if (Date.now() > expiraEm) {
            localStorage.removeItem(LOJA_KEY)
            return null
        }
        return valor
    } catch {
        // valor de uma versão anterior, salvo como string pura sem expiração
        localStorage.removeItem(LOJA_KEY)
        return null
    }
}

export function setLojaStorage(valor) {
    localStorage.setItem(LOJA_KEY, JSON.stringify({ valor, expiraEm: Date.now() + EXPIRACAO_MS }))
}
