// React
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

// Components
import Text from '../../components/Text'
import LinkSideBar from '../../components/admin/LinkSideBar'
import ConfirmModal from '../../components/public/ModalConfirm'

// Images
import { logoNm } from '../../assets/images/logos/'

export default function SideBar() {
    const [openModal, setOpenModal] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navigate = useNavigate()

    function handleLogout() {
        navigate('/')
    }

    function toggleMenu() {
        setIsMenuOpen(!isMenuOpen)
    }

    function closeMenu() {
        setIsMenuOpen(false)
    }

    return (
        <>
            {/* menu hambuerguer*/}
            <button
                onClick={toggleMenu}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-orange-base rounded-md shadow-lg hover:bg-orange-light transition-colors"
                aria-label="Menu"
            >
                {isMenuOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Menu className="w-6 h-6 text-white" />
                )}
            </button>

            {/* apenas para mobile */}
            <Text as='div'
                className={`
                    lg:hidden fixed inset-0 bg-black transition-opacity duration-300
                    ${isMenuOpen ? 'opacity-50 z-30 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={closeMenu}
            ></Text>

            {/* Sidebar */}
            <Text 
                as='aside' 
                className={`
                    flex flex-col h-[100dvh] bg-white shadow-sm
                    fixed top-0 left-0 w-[280px]
                    transition-transform duration-300 ease-in-out
                    lg:w-[15%]
                    ${isMenuOpen ? 'translate-x-0 z-40' : '-translate-x-full'}
                    lg:translate-x-0 lg:z-auto
                `}
            >
                <Text 
                    as='img' 
                    src={logoNm} 
                    alt='Logo'
                    className='w-[50%] ml-auto mr-auto mt-4' 
                />
                
                <Text as='nav' className='flex flex-col w-[80%] ml-auto mr-auto gap-3 mt-8'>
                    <LinkSideBar to='/dashboard' onClick={closeMenu}>
                        Dashboard
                    </LinkSideBar>
                    <LinkSideBar to='/cursos' onClick={closeMenu}>
                        Cursos
                    </LinkSideBar>
                </Text>

                <Link
                    onClick={() => {
                        setOpenModal(true)
                        closeMenu()
                    }}
                    className='bg-red-light shadow-sm w-[80%] rounded-md p-2 text-white
                        font-semibold cursor-pointer hover:bg-red-base ml-auto mr-auto mt-auto mb-[10%] text-center
                    '
                >
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