import { MapPin, X } from "lucide-react"

import useBodyScrollLock from "../../hooks/useBodyScrollLock"

export default function ModalBranch({
    isOpen,
    onClose,
    filtersCourses,
    setFiltersCourses,
    filtersChildrensCourses,
    setFiltersChildrensCourses,
    ...props
}) {
    useBodyScrollLock(isOpen)

    if (!isOpen) return null

    function selectLoja(loja) {
        localStorage.setItem('loja', loja)
        setFiltersCourses({ ...filtersCourses, loja })
        setFiltersChildrensCourses({ ...filtersChildrensCourses, loja })
        onClose()
    }

    return (
        <div
            className='fixed inset-0 w-full h-full bg-black/60 z-50 flex items-center justify-center p-4'
            onClick={onClose}
        >
            <div
                className='bg-white rounded-2xl shadow-2xl w-[90%] max-w-lg overflow-hidden'
                onClick={e => e.stopPropagation()}
                {...props}
            >
                <div className='flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 border-b border-gray-base/20'>
                    <div>
                        <p className='text-base sm:text-lg font-bold text-gray-text'>Selecione a loja</p>
                        <p className='hidden sm:block text-sm text-gray-text/60 mt-0.5'>Escolha a unidade para ver os cursos disponíveis</p>
                    </div>
                    <button
                        onClick={onClose}
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-base/10 transition-colors cursor-pointer'
                    >
                        <X size={18} className='text-gray-text' />
                    </button>
                </div>

                <div className='flex flex-row gap-3 p-4 sm:gap-4 sm:p-6'>

                    <button
                        onClick={() => selectLoja('Prado')}
                        className='
                            flex-1 flex flex-col items-center gap-2 p-3 sm:gap-3 sm:p-5
                            border-2 border-gray-base/20 rounded-xl
                            hover:border-orange-base hover:bg-orange-base/5
                            transition-all duration-200 cursor-pointer group
                        '
                    >
                        <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-base/10 flex items-center justify-center group-hover:bg-orange-base/20 transition-colors'>
                            <MapPin size={20} className='text-orange-base' />
                        </div>
                        <div className='text-center'>
                            <p className='font-bold text-gray-text text-sm sm:text-base'>Prado</p>
                            <p className='text-xs sm:text-sm text-gray-text/60 mt-0.5'>Nova Friburgo</p>
                        </div>
                    </button>

                    <button
                        onClick={() => selectLoja('Teresopolis')}
                        className='
                            flex-1 flex flex-col items-center gap-2 p-3 sm:gap-3 sm:p-5
                            border-2 border-gray-base/20 rounded-xl
                            hover:border-blue-base hover:bg-blue-base/5
                            transition-all duration-200 cursor-pointer group
                        '
                    >
                        <div className='w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-base/10 flex items-center justify-center group-hover:bg-blue-base/20 transition-colors'>
                            <MapPin size={20} className='text-blue-base' />
                        </div>
                        <div className='text-center'>
                            <p className='font-bold text-gray-text text-sm sm:text-base'>Várzea</p>
                            <p className='text-xs sm:text-sm text-gray-text/60 mt-0.5'>Teresópolis</p>
                        </div>
                    </button>

                </div>
            </div>
        </div>
    )
}
