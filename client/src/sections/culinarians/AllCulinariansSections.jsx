import { User } from 'lucide-react'

import CulinarianCard from "../../components/public/CulinarianCard"

export default function AllCulinariansSections({ culinaristas, loadingCulinarian }) {

    return (
        <section className='w-full px-10 sm:w-[92vw] sm:px-0 max-w-7xl mx-auto pt-10 md:pt-14 pb-16'>

            <p className='text-lg font-bold text-gray-dark md:text-3xl mb-6 md:mb-8'>
                CULINARISTAS PARCEIROS
            </p>

            {loadingCulinarian ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20'>
                    <p className='text-xl font-semibold'>Carregando...</p>
                </div>
            ) : culinaristas.length === 0 ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20 gap-3'>
                    <User size={40} className='text-gray-base/30' />
                    <p className='text-xl font-semibold text-gray-dark'>Nenhum culinarista encontrado.</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 xl:grid-cols-4 xl:gap-10'>
                    {culinaristas.map(c => (
                        <CulinarianCard
                            key={c.id}
                            id={c.id}
                            foto={c.foto}
                            nomeCulinarista={c.nomeCulinarista}
                            lojas={c.lojas}
                        />
                    ))}
                </div>
            )}

        </section>
    )
}
