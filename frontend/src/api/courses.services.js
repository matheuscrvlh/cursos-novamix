const URL = 'http://localhost:3001/api'

// ============== POST
export async function postCourse(formData) {
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            body: formData
        });

        console.log()

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}

// ============== GET
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

// ============== PUT
export async function putCourse(cursoId, body) {
    try {
        const res = await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'PUT',
            body: body
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Curso:', err);
    }
}

// ============== DELETE
export async function deleteCourse(cursoId) {
    try {
        await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}