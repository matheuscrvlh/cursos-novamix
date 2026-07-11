const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

// ============== POST
export async function postCulinarian(formData) {
    try {
        const res = await fetch(`${URL}/culinaristas`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Curso:', err);
    }
}

// ============== GET
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

// ============== PUT
export async function putCulinarian(culinarianId, formData) {
    try {
        const res = await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Culinarista:', err);
    }
}

// ============== DELETE
export async function deleteCulinarian(culinarianId) {
    try {
        await fetch((`${URL}/culinaristas/${culinarianId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}