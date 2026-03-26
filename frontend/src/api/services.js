const URL = '/api'

export async function postCourse(formData) {
    try {
        const res = await fetch(`${URL}/cursos`, {
            method: "POST",
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}

export async function postCulinarian(formData) {
    try {
        const res = await fetch(`${URL}/culinaristas`, {
            method: "POST",
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}

export async function postIndustry(formData) {
    try {
        const res = await fetch(`${URL}/industrias`, {
            method: "POST",
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Industria:', err);
    }
}

export async function postEnrollment(data) {
    try {
        const res = await fetch(`${URL}/inscricoes`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Inscricao:', err);
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

export async function getCulinarians() {
    try {
        const res = await fetch((`${URL}/culinaristas`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Culinaristas:', err);
    }
}

export async function getIndustries() {
    try {
        const res = await fetch((`${URL}/industrias`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Industrias:', err);
    }
}
// =========== GET 

// =========== PUT
export async function putInscricoes(inscricaoId, data) {
    try {
        const res = await fetch((`${URL}/inscricoes/${inscricaoId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }); 

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Inscricao:', err);
    }
}

export async function putCulinarian(culinarianId, formData) {
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

export async function putIndustry(industryId, formData) {
    try {
        const res = await fetch((`${URL}/industrias/${industryId}`), {
            method: 'PUT',
            body: formData
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Industria:', err);
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

export async function deleteCulinarian(culinarianId) {
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

export async function deleteIndustry(industryId) {
    try {
        await fetch((`${URL}/industrias/${industryId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Industria:', err);
    }
}
// =========== DELETE
