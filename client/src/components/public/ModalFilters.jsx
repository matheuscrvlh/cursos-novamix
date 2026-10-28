import { X } from 'lucide-react'

import Input from "../Input"
import Button from "../Button"
import useBodyScrollLock from "../../hooks/useBodyScrollLock"

export default function ModalFilters({
    nameModal,
    onClose,
    isOpen,
    culinaristas,
    filtersCourses,
    setFiltersCourses,
    clear
}) {
    useBodyScrollLock(isOpen)

    if (!isOpen) return null

    return (
        <div
            className='md:hidden flex items-center justify-center fixed inset-0 w-full h-full bg-chocolate/55 backdrop-blur-sm z-50 p-4 animate-pagina'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-2xl rounded-2xl animate-surgir w-[90%] max-w-115 max-h-[90vh] overflow-y-auto overflow-x-hidden'
                onClick={e => e.stopPropagation()}
            >
                <div className='flex items-center justify-between p-5 pb-4 border-b border-chocolate/[0.08]'>
                    <div>
                        <h2 className='font-serif text-[28px] font-semibold leading-none text-chocolate'>{nameModal}</h2>
                        <p className='text-xs font-normal text-cocoa mt-1.5'>Ajuste os filtros para refinar sua busca</p>
                    </div>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className='flex flex-col gap-4 p-5'>

                    <div className='flex flex-col gap-1.5 min-w-0'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Data Inicial</label>
                        <Input
                            type='date'
                            className='w-full max-w-full cursor-pointer'
                            value={filtersCourses.dataInicial}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataInicial: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 min-w-0'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Data Final</label>
                        <Input
                            type='date'
                            className='w-full max-w-full cursor-pointer'
                            value={filtersCourses.dataFinal}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataFinal: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Loja</label>
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
                        <label className='text-xs font-semibold text-gray-text/70 uppercase tracking-wider'>Culinarista</label>
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

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-2 font-semibold'
                        onClick={clear}
                    >
                        Limpar filtros
                    </Button>

                </div>
            </div>
        </div>
    )
}
