// REACT
import { useEffect } from "react"

// ICONS
import { X } from 'lucide-react'

// COMPONENTS
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
            fixed flex justify-end bg-black/40 top-0 w-dvw h-dvh z-50
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
            <div className={`
                bg-white w-[60dvw] h-full p-5
                transform transition-transform duration-300 ease-in-out
                md:w-[25vw]
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                
                <X
                    className='ml-auto cursor-pointer hover:scale-105'
                    onClick={onClose}
                />

                <p className='text-gray-dark text-xl font-bold text-center'>
                    {nameModal}
                </p>

                <div className='flex flex-col w-[90%] gap-6 mt-10 mx-auto'>
                    
                    <div className='w-full'>
                        <p>Data Inicial</p>
                        <Input
                            type='date'
                            className='bg-white cursor-pointer px-3.5 md:w-full md:px-0'
                            value={filtersCourses.dataInicial}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataInicial: e.target.value })}
                        />
                    </div>

                    <div className='w-full'>
                        <p>Data Final</p>
                        <Input
                            type='date'
                            className='bg-white cursor-pointer px-3.5 md:w-full md:px-0'
                            value={filtersCourses.dataFinal}
                            onChange={e => setFiltersCourses({ ...filtersCourses, dataFinal: e.target.value })}
                        />
                    </div>

                    <div className='w-full'>
                        <select
                            className='bg-white py-3 w-full border border-black/50 rounded-md cursor-pointer'
                            value={filtersCourses.loja}
                            onChange={e => setFiltersCourses({ ...filtersCourses, loja: e.target.value })}
                        >
                            <option value=''>Loja</option>
                            <option value='Prado'>Prado</option>
                            <option value='Teresopolis'>Teresópolis</option>
                        </select>
                    </div>

                    <div className='w-full'>
                        <select
                            className='bg-white py-3 w-full border border-black/50 rounded-md cursor-pointer'
                            value={filtersCourses.culinarista}
                            onChange={e => setFiltersCourses({ ...filtersCourses, culinarista: e.target.value })}
                        >
                            <option value=''>Culinarista</option>
                            {culinaristas.map(c => (
                                <option key={c.id} value={c.nomeCulinarista}>
                                    {c.nomeCulinarista}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white w-full mt-10'
                        onClick={clear}
                    >
                        Limpar
                    </Button>
                </div>
            </div>
        </div>
    )
}