// Curso infantil é um curso normal com tipo='infantil' na mesma tabela —
// esses wrappers existem só pra manter a assinatura que ChildrensAdmin.jsx
// já usa, sem precisar mexer no componente.
const URL = '/api'

export async function postChildren(formData) {
    formData.set('tipo', 'infantil')
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            credentials: 'include',
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
        const res = await fetch((`${URL}/cursos?tipo=infantil`), {
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
    formData.set('tipo', 'infantil')
    try {
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'PUT',
            credentials: 'include',
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
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'DELETE',
            credentials: 'include'
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
