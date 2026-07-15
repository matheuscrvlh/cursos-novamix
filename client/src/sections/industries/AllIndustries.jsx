import IndustryCard from "../../components/public/IndustryCard"

import { Building2 } from 'lucide-react'

export default function AllIndustries({
    industrias
}) {
    return (
        <section className='w-[90vw] md:w-[80vw] mx-auto pt-10 md:pt-15 pb-20'>

            <p className='text-lg font-bold text-gray-dark md:text-3xl mb-8'>
                NOSSOS PARCEIROS
            </p>

            {industrias.length === 0 ? (
                <div className='flex flex-col items-center justify-center w-full text-center mt-20 gap-3'>
                    <Building2 size={40} className='text-gray-base/30' />
                    <p className='text-xl font-semibold text-gray-dark'>Nenhuma indústria encontrada.</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
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
