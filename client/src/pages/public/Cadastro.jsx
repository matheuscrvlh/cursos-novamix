import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { bannerHome } from '../../assets/images/banner'

const FORM_VAZIO = { nome: '', email: '', senha: '', cpf: '', celular: '', loja: '' }

export default function Cadastro() {
    const { cadastrar } = useContext(ClienteAuthContext)
    const navigate = useNavigate()

    const [form, setForm] = useState(FORM_VAZIO)
    const [erro, setErro] = useState('')
    const [enviando, setEnviando] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setErro('')

        if (form.senha.length < 6) {
            setErro('A senha precisa ter pelo menos 6 caracteres.')
            return
        }

        setEnviando(true)
        const res = await cadastrar(form)
        setEnviando(false)
        if (!res.ok) {
            setErro(res.message || 'Erro ao cadastrar.')
            return
        }
        navigate('/minha-conta')
    }

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Criar conta | Novamix Cursos' />
            <section className='max-w-100 mx-auto px-5 py-16'>
                <h1 className='text-2xl font-bold text-gray-dark mb-1'>Criar conta</h1>
                <p className='text-sm text-gray-text/70 mb-6'>Cadastre-se pra se inscrever nos cursos.</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input placeholder='Nome completo' value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                    <Input type='email' placeholder='E-mail' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <Input type='password' placeholder='Senha (mínimo 6 caracteres)' value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
                    <Input placeholder='CPF' value={form.cpf} onChange={e => setForm({ ...form, cpf: e.target.value })} required />
                    <Input placeholder='Celular' value={form.celular} onChange={e => setForm({ ...form, celular: e.target.value })} required />

                    <select
                        value={form.loja}
                        onChange={e => setForm({ ...form, loja: e.target.value })}
                        className='p-2.5 border border-gray-base rounded-md text-gray-text bg-white'
                        required
                    >
                        <option value=''>Loja de preferência</option>
                        <option value='Prado'>Prado</option>
                        <option value='Teresopolis'>Teresópolis</option>
                    </select>

                    {erro && <p className='text-red-base text-sm'>{erro}</p>}

                    <Button type='submit' className='bg-orange-base hover:bg-orange-light text-white mt-2 disabled:opacity-60' disabled={enviando}>
                        {enviando ? 'Criando conta...' : 'Criar conta'}
                    </Button>
                </form>

                <p className='text-sm text-gray-text/70 text-center mt-4'>
                    Já tem conta? <Link to='/entrar' className='text-orange-base font-semibold hover:underline'>Entrar</Link>
                </p>
            </section>
        </PublicLayout>
    )
}
