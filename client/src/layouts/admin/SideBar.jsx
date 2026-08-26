import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

import LinkSideBar from '../../components/admin/LinkSideBar'

import { logoNm } from '../../assets/images/logos/'

const HUB_URL = 'https://hub.lojanovamix.com.br'

export default function SideBar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    function toggleMenu() {
        setIsMenuOpen(!isMenuOpen)
    }

    function closeMenu() {
        setIsMenuOpen(false)
    }

    return (
        <>
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

            <div className={`
                    lg:hidden fixed inset-0 bg-black transition-opacity duration-300
                    ${isMenuOpen ? 'opacity-50 z-30 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                onClick={closeMenu}
            ></div>

            <aside className={`
                    flex flex-col h-dvh bg-white shadow-sm
                    fixed top-0 left-0 w-70
                    transition-transform duration-300 ease-in-out
                    lg:w-[15%]
                    ${isMenuOpen ? 'translate-x-0 z-40' : '-translate-x-full'}
                    lg:translate-x-0 lg:z-auto
                `}
            >
                <img src={logoNm} 
                    alt='Logo'
                    className='w-[50%] ml-auto mr-auto mt-4' 
                />
                
                <nav className='flex flex-col w-[80%] ml-auto mr-auto gap-3 mt-8'>
                    <LinkSideBar to='/dashboardAdmin' onClick={closeMenu}>
                        Dashboard
                    </LinkSideBar>
                    <LinkSideBar to='/cursosAdmin' onClick={closeMenu}>
                        Cursos
                    </LinkSideBar>
                    <LinkSideBar to ='/infantisAdmin' onClick={closeMenu}>
                        Cursos Infantis
                    </LinkSideBar>
                    <LinkSideBar to='/inscricoesAdmin' onClick={closeMenu}>
                        Inscrições
                    </LinkSideBar>
                    <LinkSideBar to='/clientesAdmin' onClick={closeMenu}>
                        Clientes
                    </LinkSideBar>
                    <LinkSideBar to='/culinaristasAdmin' onClick={closeMenu}>
                        Culinaristas
                    </LinkSideBar>
                    <LinkSideBar to='/industriasAdmin' onClick={closeMenu}>
                        Industrias
                    </LinkSideBar>
                    <LinkSideBar to='/marketingAdmin' onClick={closeMenu}>
                        Marketing
                    </LinkSideBar>
                </nav>

                <a
                    href={HUB_URL}
                    className='bg-red-base shadow-sm w-[80%] rounded-md p-2 text-white
                        font-semibold cursor-pointer hover:bg-red-light ml-auto mr-auto mt-auto mb-[10%] text-center
                    '
                >
                    ← Voltar ao Hub
                </a>
            </aside>
        </>
    )
}