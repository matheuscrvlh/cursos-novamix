import { createContext, useEffect, useState } from 'react';

const HUB_URL = 'https://hub.lojanovamix.com.br';

export const AdminAuthContext = createContext();

// Login é feito no hub-novamix — aqui só perguntamos pro backend (via cookie
// httpOnly compartilhado em .lojanovamix.com.br) se a sessão é válida e qual
// o nível de acesso ao módulo 'cursos'. Sem sessão válida, manda direto pro
// hub — não existe mais tela de login própria neste projeto.
export function AdminAuthProvider({ children }) {
    const [access, setAccess] = useState(null);
    // isAdmin vem do role do usuário no hub (public.users.role), não do nível
    // de acesso ao módulo — qualquer usuário com o módulo liberado já pode
    // fazer tudo, isAdmin só libera as ações restritas (excluir, reembolsar)
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/auth/me', { credentials: 'include' })
            .then(res => {
                if (!res.ok) {
                    window.location.href = HUB_URL;
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setAccess(data.access);
                    setIsAdmin(data.isAdmin === true);
                }
            })
            .catch(() => { window.location.href = HUB_URL; })
            .finally(() => setLoading(false));
    }, []);

    return (
        <AdminAuthContext.Provider value={{ access, isAdmin, loading }}>
            {children}
        </AdminAuthContext.Provider>
    );
}
