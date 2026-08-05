const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postChildren(formData) {
    try {
        const res = await fetch(`${URL}/cursos-infantis`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch(err) {
        console.error('Erro ao adicionar Curso Infantil:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function getChildren() {
    try {
        const res = await fetch((`${URL}/cursos-infantis`), {
            method: 'GET'
        });

        if (!res.ok) return []
        return res.json()

    }
    catch (err) {
        console.error('Erro ao buscar Cursos Infantis:', err);
        return []
    }
}

export async function putChildren(cursoId, formData) {
    try {
        const res = await fetch((`${URL}/cursos-infantis/${cursoId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch (err) {
        console.error('Erro ao editar Curso Infantil:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function deleteChildren(cursoId) {
    try {
        const res = await fetch((`${URL}/cursos-infantis/${cursoId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.error || data.message || 'Erro ao excluir curso infantil.' }
        }
        return { ok: true }

    } catch (err) {
        console.error('Erro ao deletar Curso Infantil:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}
