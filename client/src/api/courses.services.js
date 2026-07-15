const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postCourse(formData) {
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}

export async function getCourseById(cursoId) {
    try {
        const res = await fetch(`${URL}/cursos/${cursoId}`, { method: 'GET' });
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

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Cursos:', err);
    }
}

export async function putCourse(cursoId, body) {
    try {
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: body
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Curso:', err);
    }
}

export async function deleteCourse(cursoId) {
    try {
        await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}