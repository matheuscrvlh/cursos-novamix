const URL = '/api'

export async function postCourse(formData) {
    formData.set('tipo', 'normal')
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            credentials: 'include',
            body: formData
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function getCourseById(cursoId) {
    try {
        const res = await fetch(`${URL}/cursos/${cursoId}`, { method: 'GET' });
        if (!res.ok) return null
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar Curso:', err);
    }
}

export async function getCourses() {
    try {
        const res = await fetch((`${URL}/cursos`), {
            method: 'GET'
        });

        if (!res.ok) return []
        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Cursos:', err);
        return []
    }
}

export async function putCourse(cursoId, body) {
    body.set('tipo', 'normal')
    try {
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'PUT',
            credentials: 'include',
            body: body
        });

        const data = await res.json().catch(() => ({}))
        return { ...data, ok: res.ok }

    } catch (err) {
        console.error('Erro ao editar Curso:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function deleteCourse(cursoId) {
    try {
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.error || data.message || 'Erro ao excluir curso.' }
        }
        return { ok: true }

    } catch (err) {
        console.error('Erro ao deletar Curso:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}
