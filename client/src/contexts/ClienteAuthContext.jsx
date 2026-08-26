import { createContext, useEffect, useState } from 'react'

import { getClienteLogado, loginCliente, logoutCliente, cadastrarCliente, editarClienteLogado } from '../api/clientes.services'

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

    async function atualizarPerfil(dados) {
        const res = await editarClienteLogado(dados)
        if (res.ok) setCliente(res)
        return res
    }

    return (
        <ClienteAuthContext.Provider value={{ cliente, loading, login, cadastrar, logout, atualizarPerfil }}>
            {children}
        </ClienteAuthContext.Provider>
    )
}
