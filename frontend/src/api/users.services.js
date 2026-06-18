const BASE = '/api/usuarios';

function authHeader() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getUsuarios() {
    const res = await fetch(BASE, { headers: authHeader() });
    return res.json();
}

export async function postUsuario(data) {
    const res = await fetch(BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function putUsuario(id, data) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify(data),
    });
    return res.json();
}

export async function deleteUsuario(id) {
    const res = await fetch(`${BASE}/${id}`, {
        method: 'DELETE',
        headers: authHeader(),
    });
    return res.json();
}

export async function login(usuario, senha) {
    const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha }),
    });
    return res.json();
}
