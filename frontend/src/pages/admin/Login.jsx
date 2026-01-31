// React
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// HEAD
import { Head } from '../../components/Head'

// Components
import Text from '../../components/Text'
import Button from '../../components/Button'
import Input from '../../components/Input'

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor'

// Images
import { bannerLogin } from '../../assets/images/banner'
import { logoNm } from '../../assets/images/logos'

export default function Login() {
    const navigate = useNavigate();

    const [ form, setForm ] = useState({
        user: '',
        password: ''
    });

    function Login() {
        if(form.user === 'admin' & form.password === 'admin') {
            navigate('/dashboard');
            setForm({
                user: '',
                password: ''
            })
        } else {
            alert('Usuário ou senha Inválidos')
        }
    }

    function Sair() {
        navigate('/')
    }

    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    return (
        <Text as='main' className='w-full min-h-screen flex relative overflow-hidden'>
            <Head title='Loja Novamix | Login'/>
            {/* Imagem de fundo */}
            <Text 
                as='img' 
                src={bannerLogin} 
                alt='Banner Loja' 
                className='absolute inset-0 w-full h-full object-cover'
            />
            {/* Card de Login */}
            <Text 
                as='div' 
                className='bg-white w-[90%] max-w-[380px] mx-auto my-auto flex flex-col gap-3 p-6 
                           justify-center rounded-xl shadow-2xl relative z-10
                           md:w-[420px] md:max-w-[420px] md:absolute md:right-[8%] 
                           md:top-1/2 md:-translate-y-1/2 md:mx-0
                           lg:right-[10%]'
            >
                <Text 
                    as='img' 
                    src={logoNm} 
                    alt='Logo' 
                    className='w-[45%] max-w-[140px] mx-auto mb-3'
                />
                
                <Input 
                    type='text'
                    placeholder='Usuario' 
                    className='bg-gray w-full rounded p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-base'
                    value={form.user}
                    onChange={e => setForm({ ...form, user: e.target.value})}
                />
                
                <Input
                    type='password'
                    placeholder='Senha' 
                    className='bg-gray w-full rounded p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-base'
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value})}
                />
                
                <Button 
                    className='bg-orange-base text-white font-semibold cursor-pointer hover:bg-orange-light 
                               hover:shadow-lg w-full rounded p-3 mt-3 transition-all
                               active:scale-95 text-base'
                    onClick={Login}
                >
                    Login
                </Button>
                
                <Text
                    as='p'
                    className='text-center cursor-pointer text-gray-dark hover:text-red-base 
                               transition-colors mt-2 text-sm'
                    onClick={Sair}
                >
                    Sair
                </Text>
            </Text>
        </Text>
    )
}
