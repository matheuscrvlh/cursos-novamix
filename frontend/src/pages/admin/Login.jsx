import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Head } from '../../components/Head'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useThemeColor } from '../../hooks/useThemeColor'
import { bannerLogin } from '../../assets/images/banner'
import { logoNm } from '../../assets/images/logos'
import { login } from '../../api/users.services'

export default function Login() {
    const navigate = useNavigate();

    const [form, setForm] = useState({ usuario: '', senha: '' });
    const [erro, setErro] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        setErro('');

        if (!form.usuario || !form.senha) {
            setErro('Preencha usuário e senha.');
            return;
        }

        setLoading(true);
        try {
            const res = await login(form.usuario, form.senha);

            if (res.error) {
                setErro(res.error);
                return;
            }

            localStorage.setItem('token', res.token);
            localStorage.setItem('usuario', res.usuario);
            navigate('/dashboardAdmin');
        } catch {
            setErro('Erro de conexão. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    useThemeColor('#FF8D0A');

    return (
        <main className='w-full min-h-screen flex relative overflow-hidden'>
            <Head title='Loja Novamix | Login' />

            <img
                src={bannerLogin}
                alt='Banner Loja'
                className='absolute inset-0 w-full h-full object-cover'
            />

            <div className='bg-white w-[90%] max-w-[380px] mx-auto my-auto flex flex-col gap-3 p-6
                           justify-center rounded-xl shadow-2xl relative z-10
                           md:w-[420px] md:max-w-[420px] md:absolute md:right-[8%]
                           md:top-1/2 md:-translate-y-1/2 md:mx-0
                           lg:right-[10%]'
            >
                <img src={logoNm} alt='Logo' className='w-[45%] max-w-35 mx-auto mb-3' />

                <form
                    className='flex flex-col gap-3'
                    onSubmit={e => { e.preventDefault(); handleLogin(); }}
                >
                    <Input
                        type='text'
                        placeholder='Usuário'
                        className='bg-gray w-full rounded p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-base'
                        value={form.usuario}
                        onChange={e => setForm({ ...form, usuario: e.target.value })}
                    />

                    <Input
                        type='password'
                        placeholder='Senha'
                        className='bg-gray w-full rounded p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-base'
                        value={form.senha}
                        onChange={e => setForm({ ...form, senha: e.target.value })}
                    />

                    {erro && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md text-center'>{erro}</p>
                    )}

                    <Button
                        type='submit'
                        disabled={loading}
                        className='bg-orange-base text-white font-semibold cursor-pointer hover:bg-orange-light
                                   hover:shadow-lg w-full rounded p-3 mt-2 transition-all
                                   active:scale-95 text-base disabled:opacity-60'
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <p
                    className='text-center cursor-pointer text-gray-dark hover:text-red-500
                               transition-colors mt-1 text-sm'
                    onClick={() => navigate('/')}
                >
                    Voltar ao site
                </p>
            </div>
        </main>
    );
}
