export async function request(url, options = {}) {
    const headers = options.body instanceof FormData
        ? {}
        : { 'Content-Type': 'application/json' };

    const response = await fetch(`http://72.61.25.63:3001${url}`, {
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
