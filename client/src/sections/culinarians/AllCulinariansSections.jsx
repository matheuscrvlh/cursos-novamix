import { User } from 'lucide-react'

import CulinarianCard from "../../components/public/CulinarianCard"

export default function AllCulinariansSections({ culinaristas, loadingCulinarian }) {

    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16'>

            <div className='mb-10 md:mb-12'>
                <p className='text-[11px] font-medium uppercase tracking-[0.32em] text-gold mb-2'>Quem ensina</p>
                <h1 className='font-serif text-[40px] md:text-[52px] font-bold text-chocolate leading-[1.05]'>Culinaristas <em className='italic text-orange-base'>parceiros</em></h1>
            </div>

            {loadingCulinarian ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20'>
                    <p className='font-serif text-2xl text-cocoa'>Carregando...</p>
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
