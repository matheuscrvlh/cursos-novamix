const URL = '/api'

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getBanners(posicao) {
    try {
        const query = posicao ? `?posicao=${posicao}` : ''
        const res = await fetch(`${URL}/banners${query}`)
        return res.json()
    } catch (err) {
        console.error('Erro ao buscar banners:', err)
        return []
    }
}

export async function postBanner(formData) {
    try {
        const res = await fetch(`${URL}/banners`, {
            method: 'POST',
            headers: { ...authHeader() },
            body: formData
        })
        return res.json()
    } catch (err) {
        console.error('Erro ao criar banner:', err)
        throw err
    }
}

export async function putBanner(id, data) {
    try {
        const res = await fetch(`${URL}/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(data)
        })
        return res.json()
    } catch (err) {
        console.error('Erro ao atualizar banner:', err)
        throw err
    }
}

export async function deleteBanner(id) {
    try {
        await fetch(`${URL}/banners/${id}`, { method: 'DELETE', headers: { ...authHeader() } })
    } catch (err) {
        console.error('Erro ao deletar banner:', err)
        throw err
    }
}
