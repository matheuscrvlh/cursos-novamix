const URL = '/api/clientes'

async function post(path, body) {
    try {
        const res = await fetch(`${URL}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(body),
        })
        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }
    } catch (err) {
        console.error(`Erro em POST ${path}:`, err)
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export function cadastrarCliente(dados) {
    return post('/cadastro', dados)
}

export function loginCliente(email, senha) {
    return post('/login', { email, senha })
}

export function logoutCliente() {
    return post('/logout', {})
}

export function esqueciSenha(email) {
    return post('/esqueci-senha', { email })
}

export function redefinirSenha(token, novaSenha) {
    return post('/redefinir-senha', { token, novaSenha })
}

export async function validarTokenRedefinicao(token) {
    try {
        const res = await fetch(`${URL}/redefinir-senha/${encodeURIComponent(token)}`)
        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }
    } catch (err) {
        console.error('Erro ao validar token de redefinição:', err)
        return { ok: false, valido: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function getClienteLogado() {
    try {
        const res = await fetch(`${URL}/me`, { credentials: 'include' })
        if (!res.ok) return null
        return res.json()
    } catch {
        return null
    }
}

export async function editarClienteLogado(dados) {
    try {
        const res = await fetch(`${URL}/me`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(dados),
        })
        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }
    } catch (err) {
        console.error('Erro ao editar cliente:', err)
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export function alterarSenhaLogado(senhaAtual, novaSenha) {
    return post('/alterar-senha', { senhaAtual, novaSenha })
}

export async function getMinhasInscricoes() {
    try {
        const res = await fetch(`${URL}/minhas-inscricoes`, { credentials: 'include' })
        if (!res.ok) return []
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar minhas inscrições:', err)
        return []
    }
}

// --- admin ---

export async function getClientesAdmin({ busca, status, criadoInicio, criadoFim } = {}) {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    if (status && status !== 'todos') params.set('status', status)
    if (criadoInicio) params.set('criadoInicio', criadoInicio)
    if (criadoFim) params.set('criadoFim', criadoFim)

    try {
        const res = await fetch(`${URL}?${params.toString()}`, { credentials: 'include' })
        if (!res.ok) return []
        return res.json()
    } catch (err) {
        console.error('Erro ao listar clientes:', err)
        return []
    }
}

export async function getClientesStats() {
    try {
        const res = await fetch(`${URL}/estatisticas`, { credentials: 'include' })
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar estatísticas de clientes:', err)
        return null
    }
}

export async function getClienteAdmin(id) {
    try {
        const res = await fetch(`${URL}/${id}`, { credentials: 'include' })
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar cliente:', err)
        return null
    }
}

export async function enviarRedefinicaoSenhaAdmin(id) {
    try {
        const res = await fetch(`${URL}/${id}/redefinir-senha`, { method: 'POST', credentials: 'include' })
        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }
    } catch (err) {
        console.error('Erro ao enviar redefinição de senha:', err)
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function atualizarStatusClienteAdmin(id, status) {
    try {
        const res = await fetch(`${URL}/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ status }),
        })
        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }
    } catch (err) {
        console.error('Erro ao atualizar status do cliente:', err)
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function excluirClienteAdmin(id) {
    try {
        const res = await fetch(`${URL}/${id}`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.message || 'Erro ao excluir cliente.' }
        }
        return { ok: true }
    } catch (err) {
        console.error('Erro ao excluir cliente:', err)
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}
