import IndustryCard from "../../components/public/IndustryCard"

import { Building2 } from 'lucide-react'

export default function AllIndustries({
    industrias,
    loadingIndustries
}) {
    return (
        <section className='w-full px-10 sm:w-[92vw] sm:px-0 max-w-7xl mx-auto pt-10 md:pt-14 pb-16'>

            <p className='text-lg font-bold text-gray-dark md:text-3xl mb-6 md:mb-8'>
                NOSSOS PARCEIROS
            </p>

            {loadingIndustries ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20'>
                    <p className='text-xl font-semibold'>Carregando...</p>
                </div>
            ) : industrias.length === 0 ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20 gap-3'>
                    <Building2 size={40} className='text-gray-base/30' />
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
