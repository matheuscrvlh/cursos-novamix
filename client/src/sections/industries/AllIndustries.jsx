import IndustryCard from "../../components/public/IndustryCard"

import { Building2 } from 'lucide-react'

export default function AllIndustries({
    industrias,
    loadingIndustries
}) {
    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16'>

            <div className='mb-10 md:mb-12'>
                <p className='text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-gold mb-2'>Marcas que apoiam</p>
                <h1 className='font-serif text-[2.5rem] md:text-[3.25rem] font-bold text-chocolate leading-[1.05]'>Indústrias <em className='italic text-orange-base'>parceiras</em></h1>
            </div>

            {loadingIndustries ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20'>
                    <p className='font-serif text-2xl text-cocoa'>Carregando...</p>
                </div>
            ) : industrias.length === 0 ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20 gap-3'>
                    <Building2 size='2.5rem' className='text-gray-base/30' />
                    <p className='text-xl font-semibold text-gray-dark'>Nenhuma indústria encontrada.</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8'>
                    {industrias.map(i => (
                        <IndustryCard
                            key={i.id}
                            id={i.id}
                            foto={i.foto}
                            razaoSocial={i.razaoSocial}
                            nome={i.nome}
                            cnpj={i.cnpj}
                            telefone={i.telefone}
                            email={i.email}
                            site={i.site}
                            endereco={i.endereco}
                            instagram={i.instagram}
                        />
                    ))}
                </div>
            )}

        </section>
    )
}
