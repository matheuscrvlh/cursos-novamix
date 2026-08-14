const URL = '/api'

export async function postEnrollment(data) {
    try {
        const res = await fetch(`${URL}/inscricoes`, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        return res.json()

    } catch(err) {
        console.error('Erro ao adicionar Inscricao:', err);
    }
}

export async function getSeats(cursoId) {
    try {
        const res = await fetch((`${URL}/assentos/${cursoId}`), {
            method: 'GET'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Assentos:', err);
    }
}

export async function getEnrollment(cursoId) {
    try {
        const res = await fetch((`${URL}/inscricoes/curso/${cursoId}`), {
            method: 'GET',
            credentials: 'include'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes por Curso:', err);
    }
}

export async function getTotalEnrollment() {
    try {
        const res = await fetch((`${URL}/inscricoes`), {
            method: 'GET',
            credentials: 'include'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao buscar Inscricoes Totais:', err);
    }
}

export async function putEnrollment(inscricaoId, data) {
    try {
        const res = await fetch((`${URL}/inscricoes/${inscricaoId}`), {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        const json = await res.json()
        return { ...json, ok: res.ok }

    } catch (err) {
        console.error('Erro ao editar Inscricao:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

// Troca de assento — rota pública (o cliente ainda não está logado, é a
// inscrição dele mesmo antes de pagar)
export async function putSeatChange(inscricaoId, assento) {
    try {
        const res = await fetch((`${URL}/inscricoes/${inscricaoId}/assento`), {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assento })
        });

        const json = await res.json()
        return { ...json, ok: res.ok }

    } catch (err) {
        console.error('Erro ao trocar assento:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

// Cancela a própria inscrição pendente e libera o assento — rota pública
// (o cliente ainda não está logado, é a inscrição dele mesmo antes de pagar)
export async function cancelEnrollment(inscricaoId) {
    try {
        const res = await fetch((`${URL}/inscricoes/${inscricaoId}/cancelar`), {
            method: 'POST'
        });

        return res.json()

    } catch (err) {
        console.error('Erro ao cancelar Inscricao:', err);
    }
}

export async function deleteEnrollment(inscricaoId) {
    try {
        const res = await fetch((`${URL}/inscricoes/${inscricaoId}`), {
            method: 'DELETE',
            credentials: 'include'
        });

        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            return { ok: false, message: data.message || 'Erro ao excluir inscrição.' }
        }
        return { ok: true }

    } catch (err) {
        console.error('Erro ao deletar Inscricao:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' }
    }
}

export async function verificarPagamentoMP(inscricaoId) {
    try {
        const res = await fetch(`${URL}/pagamentos/verificar/${inscricaoId}`, {
            method: 'POST',
            credentials: 'include',
        });
        return res.json();
    } catch (err) {
        console.error('Erro ao verificar pagamento MP:', err);
    }
}

export async function reembolsarPagamentoMP(inscricaoId) {
    try {
        const res = await fetch(`${URL}/pagamentos/reembolsar/${inscricaoId}`, {
            method: 'POST',
            credentials: 'include',
        });
        const json = await res.json();
        return { ...json, ok: res.ok };
    } catch (err) {
        console.error('Erro ao reembolsar pagamento MP:', err);
        return { ok: false, message: 'Erro de conexão. Tente novamente.' };
    }
}
