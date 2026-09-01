import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import PublicLayout from '../../layouts/public/PublicLayout'
import { Head } from '../../components/Head'
import Input from '../../components/Input'
import Button from '../../components/Button'

import { ClienteAuthContext } from '../../contexts/ClienteAuthContext'
import { bannerHome } from '../../assets/images/banner'

const FORM_VAZIO = { nome: '', email: '', senha: '', cpf: '', celular: '', loja: '' }

// Formata o CPF enquanto o cliente digita: 000.000.000-00
function maskCpf(value) {
    return value
        .replace(/\D/g, '')
        .slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
}

// Formata só a parte local do celular (sem o DDI, que fica fixo ao lado):
// detecta 8 ou 9 dígitos pra encaixar o hífen no lugar certo enquanto digita
function maskCelular(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2) return digits.replace(/^(\d*)/, '($1')
    if (digits.length <= 6) return digits.replace(/^(\d{2})(\d*)/, '($1) $2')
    if (digits.length <= 10) return digits.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3')
    return digits.replace(/^(\d{2})(\d{5})(\d*)/, '($1) $2-$3')
}

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
        const res = await cadastrar({ ...form, celular: `+55 ${form.celular}`.trim() })
        setEnviando(false)
        if (!res.ok) {
            setErro(res.message || 'Erro ao cadastrar.')
            return
        }
        navigate('/minha-conta')
    }

    return (
        <PublicLayout bannerHome={bannerHome}>
            <Head title='Criar conta' />
            <section className='max-w-100 mx-auto px-5 py-16'>
                <h1 className='text-2xl font-bold text-gray-dark mb-1'>Criar conta</h1>
                <p className='text-sm text-gray-text/70 mb-6'>Cadastre-se pra se inscrever nos cursos.</p>

                <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
                    <Input placeholder='Nome completo' value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} required />
                    <Input type='email' placeholder='E-mail' value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                    <Input type='password' placeholder='Senha (mínimo 6 caracteres)' value={form.senha} onChange={e => setForm({ ...form, senha: e.target.value })} required />
                    <Input placeholder='CPF' value={form.cpf} onChange={e => setForm({ ...form, cpf: maskCpf(e.target.value) })} required />
                    <div className='flex gap-2'>
                        <div className='flex items-center justify-center px-3 border border-gray-base rounded-md text-gray-text bg-gray shrink-0 select-none'>
                            +55
                        </div>
                        <Input
                            placeholder='Celular'
                            value={form.celular}
                            onChange={e => setForm({ ...form, celular: maskCelular(e.target.value) })}
                            className='flex-1'
                            required
                        />
                    </div>

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
