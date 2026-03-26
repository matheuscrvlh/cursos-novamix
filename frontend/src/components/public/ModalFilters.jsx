// REACT
import { useEffect } from "react"

// ICONS
import { X } from 'lucide-react'

// COMPONENTS
import Text from "../Text"
import Input from "../Input"
import Button from "../Button"

export default function ModalFilters({
    nameModal,
    onClose,
    isOpen,
    culinaristas,
    filters,
    setFilters,
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
        <Text as='div' className={`
            fixed flex justify-end bg-black/70 top-0 w-dvw h-dvh z-50
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}>
            <Text as='div' className={`
                bg-white w-[90dvw] h-full p-5
                transform transition-transform duration-300 ease-in-out
                md:w-[25vw]
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <X
                    className='ml-auto cursor-pointer hover:scale-105'
                    onClick={onClose}
                />
                <Text as='p' className='text-gray-dark text-3xl font-bold text-center'>{nameModal}</Text>
                <Text as='div' className='flex flex-col gap-6 mt-10'>
                    <Text as='div'>
                        <Text as='p'>Data Inicial</Text>
                        <Input
                            type='date'
                            className='bg-white cursor-pointer w-[90%]'
                            value={filters.dataInicial}
                            onChange={e => setFilters({ ...filters, dataInicial: e.target.value })}
                        />
                    </Text>
                    <Text as='div'>
                        <Text as='p'>Data Final</Text>
                        <Input
                            type='date'
                            className='bg-white cursor-pointer w-[90%]'
                            value={filters.dataFinal}
                            onChange={e => setFilters({ ...filters, dataFinal: e.target.value })}
                        />
                    </Text>
                    <Text as='div' className='mt-auto'>
                        <Text
                            as='select'
                            className='bg-white w-[90%] h-11 p-2 border border-black/50 rounded-md cursor-pointer'            
                            value={filters.loja}
                            onChange={e => setFilters({ ...filters, loja: e.target.value })}
                        >
                            <Text as='option' value=''>Loja</Text>
                            <Text as='option' value='Prado'>Prado</Text>
                            <Text as='option' value='Teresopolis'>Teresópolis</Text>
                        </Text>
                    </Text>
                    <Text as='div' className='mt-auto'>
                        <Text
                            as='select'
                            className='bg-white w-[90%] h-11 p-2 border border-black/50 rounded-md cursor-pointer'
                            value={filters.culinarista}
                            onChange={e => setFilters({ ...filters, culinarista: e.target.value })}
                        >
                            <Text as='option' value=''>Culinarista</Text>
                            {culinaristas.map(c => {
                                return (
                                    <Text key={c.id} as='option' value={c.nomeCulinarista}>{c.nomeCulinarista}</Text>
                                )
                            })}
                        </Text>
                    </Text>
                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={clear}
                    >
                        Limpar
                    </Button>
                </Text>
            </Text>
        </Text>
    )
}