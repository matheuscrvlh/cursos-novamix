import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

function tokenExpirado(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (!payload.exp) return false
        return Date.now() >= payload.exp * 1000
    } catch {
        return true
    }
}

export default function RequireAuth() {
    const [autenticado, setAutenticado] = useState(() => {
        const token = localStorage.getItem('token')
        return !!token && !tokenExpirado(token)
    })

    // sem isso, uma sessão que expira enquanto o admin fica parado numa
    // página só seria detectada na próxima navegação — até lá, editar/excluir
    // falha silenciosamente com 401 sem nenhum aviso de sessão expirada
    useEffect(() => {
        const interval = setInterval(() => {
            const token = localStorage.getItem('token')
            if (!token || tokenExpirado(token)) {
                localStorage.removeItem('token')
                localStorage.removeItem('usuario')
                setAutenticado(false)
            }
        }, 30000)
        return () => clearInterval(interval)
    }, [])

    return autenticado ? <Outlet /> : <Navigate to='/login' replace />
}
