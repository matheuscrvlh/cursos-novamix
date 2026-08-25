import { useState } from 'react'
import { Link } from 'react-router-dom'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { esqueciSenha } from '../../api/clientes.services'
import { bannerHome } from '../../assets/images/banner'

export default function EsqueciSenha() {
    const [email, setEmail] = useState('')
    const [mensagem, setMensagem] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setEnviando(true)
        const res = await esqueciSenha(email)
        setEnviando(false)
        setMensagem(res.message || 'Se existir uma conta com esse e-mail, enviaremos as instruções de redefinição.')
    }

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Esqueci minha senha | Novamix Cursos' />
            <section className='max-w-100 mx-auto px-5 py-16'>
                <h1 className='text-2xl font-bold text-gray-dark mb-1'>Esqueci minha senha</h1>
                <p className='text-sm text-gray-text/70 mb-6'>Informe seu e-mail pra receber o link de redefinição.</p>

                {mensagem ? (
                    <p className='text-sm text-gray-dark bg-gray rounded-lg p-4'>{mensagem}</p>
                ) : (
                    <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                        <Input type='email' placeholder='E-mail' value={email} onChange={e => setEmail(e.target.value)} required />
                        <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviando}>
                            {enviando ? 'Enviando...' : 'Enviar link de redefinição'}
                        </Button>
                    </form>
                )}

                <p className='text-sm text-gray-text/70 text-center mt-4'>
                    <Link to='/entrar' className='text-orange-base font-semibold hover:underline'>Voltar pro login</Link>
                </p>
            </section>
        </PublicLayout>
    )
}
