// React
import { Link } from 'react-router-dom'

// Components
import Text from '../../components/Text'

// Images
import { stores, whatsapp } from '../../assets/images/icons'

export default function PublicLayout({ children }) {
    return (
        <Text as='main'>
            <Text as='header' className='w-full flex justify-center text-white'>
                {/* Header responsivo */}
                <Text as='div' className='bg-orange-light w-full min-h-15 flex flex-col md:flex-row justify-center items-center gap-3 md:gap-[5%] lg:gap-[10%] xl:gap-[20%] p-3 md:p-0'>
                    <Text 
                        as='a' 
                        className='flex items-center gap-2 cursor-pointer order-2 md:order-1'
                        href='https://lojanovamix.com.br'
                        target='_self'
                    >
                        <Text as='img' src={stores} alt='Nossas Loja' className='w-5 h-5 md:w-6 md:h-6 xl:w-7 xl:h-7'/>
                        <Text as='p' className='text-xs md:text-sm'>Nossas Lojas</Text>
                    </Text>
                    
                    <Text as='p' className='font-semibold text-center text-sm md:text-base order-1 md:order-2'>
                        Venha fazer parte dos Cursos NovaMix
                    </Text>
                    
                    <Text 
                        as='a'
                        href='https://api.whatsapp.com/send?phone=5522998336225&text=Ol%C3%A1,%20gostaria%20de%20falar%20sobre%20os%20cursos'
                        target='_blank'
                        rel="noopener noreferrer"
                        className='flex w-auto h-[40px] p-2 pl-3 pr-4 bg-gray-base rounded-md gap-2 md:gap-3 cursor-pointer hover:bg-gray-base/80 order-3'
                    >
                        <Text as='img' src={whatsapp} alt='whatsapp' className='h-[20px] md:h-[25px]'/>
                        <Text as='p' className='text-xs md:text-sm font-semibold mt-[2px] whitespace-nowrap'>Atendimento Whatsapp</Text>
                    </Text>
                </Text>
            </Text>
            
            {children}
            
            <Text as='footer'>
                <Text as='div' className='w-full h-[8px] bg-gray-dark' />
                
                <Text as='nav' className='w-full h-full bg-gray'>
                    <Text as='div' className=''></Text>
                    <Text as='div' className=''></Text>
                    <Text as='div' className=''></Text>
                    <Text as='div' className=''></Text>
                </Text>
                
                <Text as='div' className='bg-orange-base h-full text-white p-4 md:p-6 pb-8 md:pb-10 pt-6 md:pt-8'>
                    <Text as='p' className='font-regular text-sm md:text-base'>
                        CNPJ: 19.303.867/0001-44 - Razão Social: NOVAMIX FOOD SERVICE COMERCIO DE ALIMENTOS LTDA
                    </Text>
                    <Text as='p' className='font-regular mb-3 md:mb-5 text-sm md:text-base'>
                        Avenida Governador Roberto Silveira, 1700 - Prado - Nova Friburgo/RJ -- CEP: 28635-000
                    </Text>
                    <Text as='p' className='font-regular text-sm md:text-base'>
                        Os preços e disponibilidade dos produtos da Loja Virtual podem não ser os mesmos da Loja Física. Na loja física temos uma maior variedade de produtos e departamentos. Imagens meramente ilustrativas.
                    </Text>
                </Text>
                
                <Text as='div' className='flex flex-col md:flex-row bg-orange-light text-white p-4 md:p-7 font-regular gap-3 md:gap-0'>
                    <Text as='p' className='text-sm md:text-base text-center md:text-left'>
                        © 2023 Novamix Food Service Comércio de Alimentos Ltda. Todos os direitos reservados.
                    </Text>
                    <Link 
                        to={'/login'}
                        className='bg-orange-base rounded p-2 md:ml-auto pb-1 text-center text-sm md:text-base'
                    >
                        Administrativo
                    </Link>
                </Text>
            </Text>
        </Text>
    )
}