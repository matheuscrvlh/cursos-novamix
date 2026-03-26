const URL = '/api'

// ============== POST
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

// ============== GET
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

// ============== PUT
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

// ============== DELETE
export async function deleteIndustry(industryId) {
    try {
        await fetch((`${URL}/industrias/${industryId}`), {
            method: 'DELETE'
        });

    } catch (err) {
        console.error('Erro ao deletar Industria:', err);
    }
}