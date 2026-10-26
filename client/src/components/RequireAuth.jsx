import { useContext, useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { AdminAuthContext, AdminAuthProvider } from '../contexts/AdminAuthContext'
import { DadosContext } from '../contexts/DadosContext'

function RequireAuthContent() {
    const { access, loading } = useContext(AdminAuthContext)
    const { ativarModoAdmin } = useContext(DadosContext)

    // sessão do hub confirmada: troca a lista de culinaristas pela versão
    // com CPF/telefone (ver DadosContext) — chamar de novo não faz nada
    useEffect(() => {
        if (!loading && access) ativarModoAdmin()
    }, [loading, access, ativarModoAdmin])

    if (loading) {
        return (
            <div className='w-full min-h-screen flex items-center justify-center text-gray-dark'>
                Carregando...
            </div>
        )
    }

    return <Outlet />
}

export default function RequireAuth() {
    return (
        <AdminAuthProvider>
            <RequireAuthContent />
        </AdminAuthProvider>
    )
}
