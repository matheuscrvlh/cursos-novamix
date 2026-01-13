import { Link } from 'react-router-dom'
import Text from '../../components/Text'
import { logoNm } from '../../assets/images/logos/'

export default function SideBar() {
    return (
        <Text as='aside' className='h-screen fixed bg-white w-[15%] shadow-sm'>
            <Text 
                as='img' 
                src={logoNm} 
                alt='Logo'
                className='w-[50%] ml-auto mr-auto' 
            />
            <Text as='nav' className='flex flex-col'>
                <Link to='/dashboard'>Dashboard</Link>
                <Link to='/cursos'>Cursos</Link>
            </Text>
        </Text>
    )
}