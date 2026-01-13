import Text from '../../components/Text'
import Button from '../../components/Button'
import { loja } from '../../assets/images/banner'
import { logoNm } from '../../assets/images/logos'

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
                className='bg-white w-120 h-120 flex flex-col gap-2 p-5 justify-center  rounded-md absolute
                     right-20 top-1/2 -translate-y-1/2'
                >
                <Text as='img' src={logoNm} alt='Logo' className='w-[50%] ml-auto mr-auto'/>
                <Text as='input' placeholder='Usuario' className='bg-gray w-full rounded p-2'/>
                <Text as='input' placeholder='Senha' className='bg-gray w-full rounded p-2'/>
                <Button 
                    className='bg-orange-base text-white font-semibold cursor-pointer hover:bg-orange-light 
                    hover:shadow-md w-full rounded p-3 mt-3
                    '>
                        Login
                    </Button>
            </Text>
        </Text>
    )
}