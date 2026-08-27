const URL = '/api/logs'

export async function getLogs(filtros = {}) {
    const params = new URLSearchParams()
    Object.entries(filtros).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') params.set(chave, valor)
    })

    try {
        const res = await fetch(`${URL}?${params.toString()}`, { credentials: 'include' })
        if (!res.ok) return []
        return res.json()
    } catch (err) {
        console.error('Erro ao listar logs:', err)
        return []
    }
}

export async function getLogsFiltrosDisponiveis() {
    try {
        const res = await fetch(`${URL}/tipos`, { credentials: 'include' })
        if (!res.ok) return { tiposEntidade: [], acoes: [] }
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar tipos de log:', err)
        return { tiposEntidade: [], acoes: [] }
    }
}
