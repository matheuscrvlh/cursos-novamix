// React
import { Link } from 'react-router-dom'

// Components
import Text from '../../components/Text'
import LinkSideBar from '../../components/admin/LinkSideBar'

// Images
import { logoNm } from '../../assets/images/logos/'

export default function SideBar() {
    return (
        <Text as='aside' className='flex flex-col h-screen fixed bg-white w-[15%] shadow-sm'>
            <Text 
                as='img' 
                src={logoNm} 
                alt='Logo'
                className='w-[50%] ml-auto mr-auto' 
            />
            <Text as='nav' className='flex flex-col w-[80%] ml-auto mr-auto gap-3'>
                <LinkSideBar to='/dashboard'>Dashboard</LinkSideBar>
                <LinkSideBar to='/cursos'>Cursos</LinkSideBar>
            </Text>
            <Link
                to='/'
                className='bg-red-light shadow-sm w-[80%] rounded-md p-2 text-white
                     font-semibold cursor-pointer hover:bg-red-base ml-auto mr-auto mt-auto mb-[10%]
            '>
                Sair
            </Link>
        </Text>
    )
}