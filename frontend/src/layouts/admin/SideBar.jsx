// React
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { useState } from 'react'

// Components
import Text from '../../components/Text'
import LinkSideBar from '../../components/admin/LinkSideBar'
import ConfirmModal from '../../components/public/ModalConfirm'

// Images
import { logoNm } from '../../assets/images/logos/'


export default function SideBar() {

    const [openModal, setOpenModal] = useState(false)
    const navigate = useNavigate()

    function handleLogout() {
        navigate('/')
    }

    return (
        <>
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
                onClick={() => setOpenModal(true)}
                className='bg-red-light shadow-sm w-[80%] rounded-md p-2 text-white
                     font-semibold cursor-pointer hover:bg-red-base ml-auto mr-auto mt-auto mb-[10%] text-center
            '>
                Sair
            </Link>
        </Text>
        <ConfirmModal
            isOpen={openModal}
            title='Confirmação de Logout'
            message='Tem certeza que deseja sair?'
            onConfirm={handleLogout}
            onCancel={() => setOpenModal(false)}
        />
      </>  
    )
}