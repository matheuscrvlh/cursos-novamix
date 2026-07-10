const URL = '/api'

// ============== POST
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
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Culinarista:', err);
    }
}