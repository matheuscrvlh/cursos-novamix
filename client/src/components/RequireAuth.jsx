import { useContext } from 'react'
import { Outlet } from 'react-router-dom'

import { AdminAuthContext, AdminAuthProvider } from '../contexts/AdminAuthContext'

function RequireAuthContent() {
    const { loading } = useContext(AdminAuthContext)

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
