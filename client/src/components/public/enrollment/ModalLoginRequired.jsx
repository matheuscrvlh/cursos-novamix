import { Link } from 'react-router-dom'
import { X, LogIn, UserPlus } from 'lucide-react'

import useBodyScrollLock from '../../../hooks/useBodyScrollLock'

export default function ModalLoginRequired({ isOpen, onClose }) {
    useBodyScrollLock(isOpen)

    if (!isOpen) return null

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-xl rounded-xl w-[90%] max-w-100 p-6'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex items-center justify-between mb-3'>
                    <h2 className='font-bold text-gray-dark text-lg'>Faça Login</h2>
                    <button
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <p className='text-sm text-gray-text/70 mb-5'>
                    Pra garantir sua vaga usamos os dados da sua conta, entre ou crie uma conta gratuita pra continuar.
                </p>

                <div className='flex flex-col gap-2.5'>
                    <Link
                        to='/entrar'
                        onClick={onClose}
                        className='flex items-center justify-center gap-2 bg-orange-base hover:bg-orange-light text-white font-semibold py-2.5 rounded-lg transition'
                    >
                        <LogIn size={16} /> Entrar
                    </Link>
                    <Link
                        to='/cadastro'
                        onClick={onClose}
                        className='flex items-center justify-center gap-2 border border-orange-base text-orange-base hover:bg-orange-base/5 font-semibold py-2.5 rounded-lg transition'
                    >
                        <UserPlus size={16} /> Criar conta
                    </Link>
                </div>
            </div>
        </div>
    )
}
