import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'

export default function Login() {
    const { login } = useContext(ClienteAuthContext)
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [senha, setSenha] = useState('')
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErro('')
        setEnviando(true)
        const res = await login(email, senha)
        setEnviando(false)
        if (!res.ok) {
            setErro(res.message || 'Erro ao entrar.')
            return
        }
        navigate('/minha-conta')
    }

    return (
        <PublicLayout showBanner={false}>
            <Head title='Entrar' />
            <section className='max-w-100 mx-auto px-5 py-16'>
                <h1 className='text-2xl font-bold text-gray-dark mb-1'>Entrar</h1>
                <p className='text-sm text-gray-text/70 mb-6'>Acesse sua conta pra ver suas inscrições.</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input type='email' placeholder='E-mail' value={email} onChange={e => setEmail(e.target.value)} required />
                    <Input type='password' placeholder='Senha' value={senha} onChange={e => setSenha(e.target.value)} required />

                    {erro && <p className='text-red-base text-sm'>{erro}</p>}

                    <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviando}>
                        {enviando ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className='flex flex-col gap-2 mt-4 text-sm text-center'>
                    <Link to='/esqueci-senha' className='text-gray-text/70 hover:text-orange-base transition'>Esqueci minha senha</Link>
                    <p className='text-gray-text/70'>
                        Não tem conta? <Link to='/cadastro' className='text-orange-base font-semibold hover:underline'>Cadastre-se</Link>
                    </p>
                </div>
            </section>
        </PublicLayout>
    )
}
