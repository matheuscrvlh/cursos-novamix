import { createContext, useEffect, useState } from 'react'

import { getClienteLogado, loginCliente, logoutCliente, cadastrarCliente } from '../api/clientes.services'

export const ClienteAuthContext = createContext()

export function ClienteAuthProvider({ children }) {
    const [cliente, setCliente] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getClienteLogado()
            .then(data => setCliente(data))
            .finally(() => setLoading(false))
    }, [])

    async function login(email, senha) {
        const res = await loginCliente(email, senha)
        if (res.ok) setCliente(res)
        return res
    }

    async function cadastrar(dados) {
        const res = await cadastrarCliente(dados)
        if (res.ok) setCliente(res)
        return res
    }

    async function logout() {
        await logoutCliente()
        setCliente(null)
    }

    return (
        <ClienteAuthContext.Provider value={{ cliente, loading, login, cadastrar, logout }}>
            {children}
        </ClienteAuthContext.Provider>
    )
}
