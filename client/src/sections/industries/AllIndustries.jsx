import IndustryCard from "../../components/public/IndustryCard"
import Reveal from "../../components/public/Reveal"
import SectionHeader from "../../components/public/SectionHeader"

import { Building2 } from 'lucide-react'

export default function AllIndustries({
    industrias,
    loadingIndustries
}) {
    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 pt-12 md:pt-16 pb-16'>

            <SectionHeader
                as='h1'
                eyebrow='Marcas que apoiam'
                titulo='Indústrias'
                destaque='parceiras'
                descricao='As marcas parceiras que apoiam os cursos nas lojas Novamix. Clique numa marca pra ver os produtos dela na nossa loja online.'
            />

            {loadingIndustries ? (
                <div className='flex flex-wrap justify-center gap-4 md:gap-6'>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className='w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)] aspect-3/4 rounded-xl bg-white ring-1 ring-chocolate/[0.06] animate-pulse' />
                    ))}
                </div>
            ) : industrias.length === 0 ? (
                <div className='flex flex-col items-center justify-center w-full text-center py-20 gap-3'>
                    <Building2 size='2.5rem' strokeWidth={1.25} className='text-gold/50' />
                    <p className='font-serif text-2xl font-semibold text-chocolate'>Nenhuma indústria encontrada.</p>
                </div>
            ) : (
                // flex-wrap centralizado em vez de grade: a última linha, quando
                // incompleta, fica no meio em vez de encostada à esquerda.
                // Larguras = (100% - espaços entre colunas) / colunas
                <div className='flex flex-wrap justify-center gap-4 md:gap-6'>
                    {industrias.map((i, idx) => (
                        <Reveal
                            key={i.id}
                            delay={(idx % 4) * 90}
                            className='flex w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.667rem)] md:w-[calc(33.333%-1rem)] lg:w-[calc(25%-1.125rem)]'
                        >
                            <IndustryCard
                                foto={i.foto}
                                razaoSocial={i.razaoSocial}
                                nome={i.nome}
                                telefone={i.telefone}
                                email={i.email}
                                site={i.site}
                                endereco={i.endereco}
                                instagram={i.instagram}
                            />
                        </Reveal>
                    ))}
                </div>
            )}

        </section>
    )
}
