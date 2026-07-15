const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function postIndustry(formData) {
    try {
        const res = await fetch(`${URL}/industrias`, {
            method: "POST",
            headers: { ...authHeader() },
            body: formData
        });

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Industria:', err);
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

export async function putIndustry(industryId, formData) {
    try {
        const res = await fetch((`${URL}/industrias/${industryId}`), {
            method: 'PUT',
            headers: { ...authHeader() },
            body: formData
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao editar Industria:', err);
    }
}

export async function deleteIndustry(industryId) {
    try {
        await fetch((`${URL}/industrias/${industryId}`), {
            method: 'DELETE',
            headers: { ...authHeader() }
        });

    } catch (err) {
        console.error('Erro ao deletar Industria:', err);
    }
}