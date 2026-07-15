import { useEffect } from "react"

import { X } from 'lucide-react'

import Input from "../Input"
import Button from "../Button"

export default function ModalFilters({
    nameModal,
    onClose,
    isOpen,
    culinaristas,
    filtersCourses,
    setFiltersCourses,
    clear
}) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <div className={`
            md:hidden fixed flex justify-end bg-black/50 top-0 w-dvw h-dvh z-50
            transition-opacity duration-300
            ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}>
            <div className={`
                bg-white w-[80dvw] h-full flex flex-col shadow-2xl
                transform transition-transform duration-300 ease-in-out
                md:w-[320px]
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>

                <div className='flex items-center justify-between px-6 py-5 border-b border-gray-base/30'>
                    <p className='text-gray-dark text-lg font-bold'>{nameModal}</p>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-base/20 transition-colors cursor-pointer'
                    >
                        <X size={18} className='text-gray-dark' />
                    </button>
                </div>

                <div className='flex flex-col flex-1 gap-5 px-6 py-7 overflow-y-auto'>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data Inicial</label>
                        <Input
                            type='date'
                            className='w-full cursor-pointer'
                            value={filtersCourses.dataInicial}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataInicial: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data Final</label>
                        <Input
                            type='date'
                            className='w-full cursor-pointer'
                            value={filtersCourses.dataFinal}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataFinal: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                        <select
                            className='p-2 w-full border border-gray-base rounded-md text-gray-text bg-white cursor-pointer'
                            value={filtersCourses.loja}
                            onChange={e => setFiltersCourses({ ...filtersCourses, loja: e.target.value })}
                        >
                            <option value=''>Todas as lojas</option>
                            <option value='Prado'>Prado</option>
                            <option value='Teresopolis'>Teresópolis</option>
                        </select>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                        <select
                            className='p-2 w-full border border-gray-base rounded-md text-gray-text bg-white cursor-pointer'
                            value={filtersCourses.culinarista}
                            onChange={e => setFiltersCourses({ ...filtersCourses, culinarista: e.target.value })}
                        >
                            <option value=''>Todas as culinaristas</option>
                            {culinaristas.map(c => (
                                <option key={c.id} value={c.nomeCulinarista}>{c.nomeCulinarista}</option>
                            ))}
                        </select>
                    </div>

                </div>

                <div className='px-6 py-5 border-t border-gray-base/30'>
                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white w-full'
                        onClick={clear}
                    >
                        Limpar filtros
                    </Button>
                </div>

            </div>
        </div>
    )
}