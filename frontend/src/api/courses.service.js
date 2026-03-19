const URL = '/api'

export async function postCourses(data) {
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            body: JSON.stringify(data)
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}
// =========== GET 
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

export async function getAssentos(cursoId) {
    try {
        const res = await fetch((`${URL}/assentos/${cursoId}`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Assentos:', err);
    }
}

export async function getInscricoes(cursoId) {
    try {
        const res = await fetch((`${URL}/inscricoes/curso/${cursoId}`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes por Curso:', err);
    }
}

export async function getInscricoesTotais() {
    try {
        const res = await fetch((`${URL}/inscricoes`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes Totais:', err);
    }
}

export async function getCulinaristas() {
    try {
        const res = await fetch((`${URL}/culinaristas`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Culinaristas:', err);
    }
}
// =========== GET 

// =========== PUT
export async function putInscricoes(cursoId, body) {
    try {
        const res = await fetch((`${URL}/inscricoes/${cursoId}`), {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Inscricao:', err);
    }
}

export async function putCulinarista(culinarianId, formData) {
    try {
        const res = await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'PUT',
            body: formData
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Culinarista:', err);
    }
}

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
// =========== PUT  

// =========== DELETE 
export async function deleteInscricao(inscricaoId) {
    try {
        await fetch((`${URL}/inscricoes/${inscricaoId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Inscricao:', err);
    }
}

export async function deleteCulinarista(culinarianId) {
    try {
        await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}

export async function deleteCourse(cursoId) {
    try {
        await fetch((`${URL}/cursos/${cursoId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}
// =========== DELETE
