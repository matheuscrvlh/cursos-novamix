export async function request(url, options = {}) {
    const response = await fetch(`http://localhost:3001${url}`, {
        headers: {
            'Content-Type': 'Application/json',
        },
        ...options
    });

    if(!response.ok) {
        throw new Error('Erro na requisição');
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}