export async function request(url, options = {}) {
    const headers = options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' };

    const response = await fetch(`http://localhost:3001${url}`, {
        ...options,
        headers
    });

    if (!response.ok) {
        throw new Error('Erro na requisição');
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}
