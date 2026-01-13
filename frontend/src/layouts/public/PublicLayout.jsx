import Text from '../../components/Text'
import { logo } from '../../assets/images/logos'

export default function PublicLayout({ children }) {
    return (
        <Text as='main'>
            <Text as='header' className='w-full'>
                <Text as='div' className=' bg-orange-light w-full h-15'>
                </Text>
                <Text as='div' className=' bg-orange-base w-full h-30 flex'>
                    <Text as='img' src={logo} alt='Logo' className=''/>
                    <Text 
                        as='input' 
                        placeholder='Buscar na Novamix...' 
                        className=''/>
                    
                </Text>
                <Text as='div' className='bg-gray w-full h-10'></Text>
            </Text>
            {children}
        </Text>
    )
}