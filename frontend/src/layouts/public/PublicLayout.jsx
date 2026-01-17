// React
import { Link } from 'react-router-dom'

// Components
import Text from '../../components/Text'

// Images
import { logo } from '../../assets/images/logos'
import { stores, whatsapp } from '../../assets/images/icons'

export default function PublicLayout({ children }) {
    return (
        <Text as='main'>
            <Text as='header' className='w-full flex justify-center text-white'>
                <Text as='div' className=' bg-orange-light w-full h-15 flex justify-center gap-[20%]'>
                    <Text 
                        as='a' 
                        className='flex mt-auto mb-auto gap-2 cursor-pointer'
                        href='https://lojanovamix.com.br'
                        target='_self'
                    >
                        <Text as='img' src={stores} alt='Nossas Loja' className='w-6 h-6 xl:w-7 xl:h-7'/>
                        <Text as='p' className='mt-[4px] text-sm'>Nossas Lojas</Text>
                    </Text>
                    <Text as='p' className='mt-auto mb-auto font-semibold'>Venha fazer parte dos Cursos NovaMix</Text>
                    <Text 
                        as='a'
                        href='https://api.whatsapp.com/send?phone=5522998336225&text=Ol%C3%A1,%20gostaria%20de%20falar%20sobre%20os%20cursos'
                        target='_blank'
                        rel="noopener noreferrer"
                        className='flex w-[16%] h-[40px] p-2 bg-gray-base mt-auto mb-auto rounded-md gap-3 cursor-pointer hover:bg-gray-base/80'
                    >
                        <Text as='img' src={whatsapp} alt='whatsapp' className='h-[25px]'/>
                        <Text as='p' className='text-sm font-semibold mt-[2px]'>Atendimento Whatsapp</Text>
                    </Text>
                </Text>
            </Text>
            {children}
            <Text as='footer' className=''>
                <Text as='div' className='w-full h-[8px] bg-gray-dark' />
                <Text as='nav' className='w-full h-full bg-gray '>
                    <Text as='div' className=''>

                    </Text>
                    <Text as='div' className=''>

                    </Text>
                    <Text as='div' className=''>

                    </Text>
                    <Text as='div' className=''>

                    </Text>
                </Text>
                <Text as='div' className='bg-orange-base h-full text-white p-6 pb-10 pt-8'>
                    <Text as='p' className='font-regular'>
                        CNPJ: 19.303.867/0001-44 - Razão Social: NOVAMIX FOOD SERVICE COMERCIO DE ALIMENTOS LTDA
                    </Text>
                    <Text as='p' className='font-regular mb-5'>
                        Avenida Governador Roberto Silveira, 1700 - Prado - Nova Friburgo/RJ -- CEP: 28635-000
                    </Text>
                    <Text as='p' className='font-regular'>
                        Os preços e disponibilidade dos produtos da Loja Virtual podem não ser os mesmos da Loja Física. Na loja física temos uma maior variedade de produtos e departamentos. Imagens meramente ilustrativas.
                    </Text>
                </Text>
                <Text as='div' className='flex bg-orange-light text-white p-7 font-regular'>
                    <Text as='p'>
                        © 2023 Novamix Food Service Comércio de Alimentos Ltda. Todos os direitos reservados.
                    </Text>
                    <Link 
                        to={'/login'}
                        className='bg-orange-base rounded p-2 ml-auto pb-1'
                    >
                        Administrativo
                    </Link>
                </Text>
            </Text>
        </Text>
    )
}