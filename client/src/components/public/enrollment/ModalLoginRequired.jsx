import { Link } from 'react-router-dom'
import { X, LogIn, UserPlus } from 'lucide-react'

import useBodyScrollLock from '../../../hooks/useBodyScrollLock'

export default function ModalLoginRequired({ isOpen, onClose }) {
    useBodyScrollLock(isOpen)

    if (!isOpen) return null

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-chocolate/55 backdrop-blur-sm z-50 p-4 animate-pagina'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-2xl rounded-2xl animate-surgir w-[90%] max-w-100 p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex items-center justify-between'>
                    <h2 className='font-serif text-[1.75rem] font-semibold leading-none text-chocolate'>Faça Login</h2>
                    <button
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                        onClick={onClose}
                    >
                        <X size='1.125rem' />
                    </button>
                </div>

                <p className='text-sm font-normal text-cocoa mt-3 mb-6'>
                    Pra garantir sua vaga usamos os dados da sua conta, entre ou crie uma conta gratuita pra continuar.
                </p>

                <div className='flex flex-col gap-2.5'>
                    <Link
                        to='/entrar'
                        onClick={onClose}
                        className='flex items-center justify-center gap-2 bg-orange-base hover:bg-chocolate text-white py-3.5 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-500'
                    >
                        <LogIn size='1rem' /> Entrar
                    </Link>
                    <Link
                        to='/cadastro'
                        onClick={onClose}
                        className='flex items-center justify-center gap-2 border border-chocolate/20 text-chocolate hover:bg-chocolate hover:text-cream py-3.5 rounded-full text-[0.6875rem] font-medium uppercase tracking-[0.2em] transition-colors duration-500'
                    >
                        <UserPlus size='1rem' /> Criar conta
                    </Link>
                </div>
            </div>
        </div>
    )
}
