const URL = '/api'

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
            credentials: 'include',
            body: formData
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'Erro ao criar banner.')
        return data
    } catch (err) {
        console.error('Erro ao criar banner:', err)
        throw err
    }
}

export async function putBanner(id, data) {
    try {
        const res = await fetch(`${URL}/banners/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(data)
        })
        const body = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(body.error || 'Erro ao atualizar banner.')
        return body
    } catch (err) {
        console.error('Erro ao atualizar banner:', err)
        throw err
    }
}

export async function deleteBanner(id) {
    try {
        const res = await fetch(`${URL}/banners/${id}`, { method: 'DELETE', credentials: 'include' })
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            throw new Error(data.error || 'Erro ao deletar banner.')
        }
    } catch (err) {
        console.error('Erro ao deletar banner:', err)
        throw err
    }
}
