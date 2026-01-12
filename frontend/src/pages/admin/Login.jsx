import Text from '../../components/Text'
import Button from '../../components/Button'
import { loja } from '../../assets/images/banner'
import { logo } from '../../assets/images/logos'

export default function Login() {
    return (
        <Text as='main' className='w-full h-full flex relative'>
            <Text 
                as='img' 
                src={loja} 
                alt='Banner Loja' 
                className='w-screen h-screen'
            />
            <Text 
                as='div' 
                className='bg-orange-base w-120 h-120 flex flex-col rounded-md absolute
                     right-20 top-1/2 -translate-y-1/2'
                >
                <Text as='img' src={logo} alt='Logo'/>
                <Text as='input' placeholder='Usuario' className='bg-blue-base'/>
                <Text as='input' placeholder='Senha' className='bg-blue-base'/>
                <Button>Login</Button>
            </Text>
        </Text>
    )
}