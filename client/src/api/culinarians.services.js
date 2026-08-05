const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postCulinarian(formData) {
    try {
        const res = await fetch(`${URL}/culinaristas`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function getCulinarians() {
    try {
        const res = await fetch((`${URL}/culinaristas`), {
            method: 'GET'
        });

        if (!res.ok) return []
        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Culinaristas:', err);
        return []
    }
}

export async function putCulinarian(culinarianId, formData) {
    try {
        const res = await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch (err) {
        console.error('Erro ao editar Culinarista:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function deleteCulinarian(culinarianId) {
    try {
        const res = await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.error || data.message || 'Erro ao excluir culinarista.' }
        }
        return { ok: true }

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}
