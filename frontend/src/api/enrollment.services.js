const URL = '/api'

// ============== POST
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

// ============== GET
export async function getSeats(cursoId) {
    try {
        const res = await fetch((`${URL}/assentos/${cursoId}`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Assentos:', err);
    }
}

export async function getEnrollment(cursoId) {
    try {
        const res = await fetch((`${URL}/inscricoes/curso/${cursoId}`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes por Curso:', err);
    }
}

export async function getTotalEnrollment() {
    try {
        const res = await fetch((`${URL}/inscricoes`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes Totais:', err);
    }
}

// ============== PUT
export async function putEnrollment(inscricaoId, data) {
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

// ============== DELETE
export async function deleteEnrollment(inscricaoId) {
    try {
        await fetch((`${URL}/inscricoes/${inscricaoId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Inscricao:', err);
    }
}