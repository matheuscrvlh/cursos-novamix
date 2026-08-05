const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postIndustry(formData) {
    try {
        const res = await fetch(`${URL}/industrias`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch(err) {
        console.error('Erro ao adicionar Industria:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function getIndustries() {
    try {
        const res = await fetch((`${URL}/industrias`), {
            method: 'GET'
        });

        if (!res.ok) return []
        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Industrias:', err);
        return []
    }
}

export async function putIndustry(industryId, formData) {
    try {
        const res = await fetch((`${URL}/industrias/${industryId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch (err) {
        console.error('Erro ao editar Industria:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function deleteIndustry(industryId) {
    try {
        const res = await fetch((`${URL}/industrias/${industryId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.error || data.message || 'Erro ao excluir indústria.' }
        }
        return { ok: true }

    } catch (err) {
        console.error('Erro ao deletar Industria:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}
