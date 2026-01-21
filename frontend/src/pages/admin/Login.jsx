// React
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Components
import Text from '../../components/Text'
import Button from '../../components/Button'
import Input from '../../components/Input'

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
            navigate('/cursos');
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

    return (
        <Text as='main' className='w-full h-full flex relative'>
            <Text 
                as='img' 
                src={bannerLogin} 
                alt='Banner Loja' 
                className='w-screen h-screen object-cover bg-cover'
            />
            <Text 
                as='div' 
                className='bg-white w-[30%] min-h-[60%] flex flex-col gap-2 p-5 justify-center  rounded-md absolute
                     right-[10%] top-1/2 -translate-y-1/2'
                >
                <Text as='img' src={logoNm} alt='Logo' className='w-[50%] ml-auto mr-auto'/>
                <Input 
                    type='text'
                    placeholder='Usuario' 
                    className='bg-gray w-full rounded p-2'
                    value={form.user}
                    onChange={e => setForm({ ...form, user: e.target.value})}
                />
                <Input
                    type='password'
                    placeholder='Senha' 
                    className='bg-gray w-full rounded p-2'
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value})}
                />
                <Button 
                    className='bg-orange-base text-white font-semibold cursor-pointer hover:bg-orange-light 
                    hover:shadow-md w-full rounded p-3 mt-3'
                    onClick={Login}
                >
                    Login
                </Button>
                <Text
                    as='p'
                    className='text-center cursor-pointer text-gray-dark hover:text-red-base '
                    onClick={Sair}
                >
                    Sair
                </Text>
            </Text>
        </Text>
    )
}