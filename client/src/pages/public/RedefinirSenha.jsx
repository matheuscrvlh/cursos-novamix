import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { redefinirSenha } from '../../api/clientes.services'
import { bannerHome } from '../../assets/images/banner'

export default function RedefinirSenha() {
    const [searchParams] = useSearchParams()
    const token = searchParams.get('token') || ''
    const navigate = useNavigate()

    const [novaSenha, setNovaSenha] = useState('')
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErro('')

        if (novaSenha.length < 6) {
            setErro('A senha precisa ter pelo menos 6 caracteres.')
            return
        }

        setEnviando(true)
        const res = await redefinirSenha(token, novaSenha)
        setEnviando(false)
        if (!res.ok) {
            setErro(res.message || 'Erro ao redefinir senha.')
            return
        }
        navigate('/entrar')
    }

    if (!token) {
        return (
            <PublicLayout bannerHome={bannerHome}>
                <Head title='Redefinir senha | Novamix Cursos' />
                <section className='max-w-100 mx-auto px-5 py-16 text-center'>
                    <p className='text-gray-dark'>Link inválido.</p>
                    <Link to='/esqueci-senha' className='text-orange-base font-semibold hover:underline'>Pedir novo link</Link>
                </section>
            </PublicLayout>
        )
    }

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Redefinir senha | Novamix Cursos' />
            <section className='max-w-100 mx-auto px-5 py-16'>
                <h1 className='text-2xl font-bold text-gray-dark mb-1'>Redefinir senha</h1>
                <p className='text-sm text-gray-text/70 mb-6'>Escolha sua nova senha.</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input type='password' placeholder='Nova senha (mínimo 6 caracteres)' value={novaSenha} onChange={e => setNovaSenha(e.target.value)} required />
                    {erro && <p className='text-red-base text-sm'>{erro}</p>}
                    <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviando}>
                        {enviando ? 'Salvando...' : 'Redefinir senha'}
                    </Button>
                </form>
            </section>
        </PublicLayout>
    )
}
