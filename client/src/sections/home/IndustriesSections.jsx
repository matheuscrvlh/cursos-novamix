import { Building2 } from 'lucide-react';

import Reveal from '../../components/public/Reveal';
import SectionHeader, { SectionAction } from '../../components/public/SectionHeader';

export default function IndustriesSections({ industrias }) {
    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 mt-24 md:mt-32'>

            <SectionHeader
                eyebrow='Marcas que apoiam'
                titulo='Indústrias'
                destaque='parceiras'
            />

            {/* logos em tons de cinza, ganhando cor no hover — deixa a parede de
                marcas uniforme e discreta, sem uma cor brigando com a outra */}
            <Reveal className='grid grid-cols-3 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8'>
                {industrias.slice(0, 16).map((industria, i) => (
                    <div key={i} className='group flex flex-col items-center gap-2.5'>

                        <div className='w-full aspect-square max-w-24 rounded-xl overflow-hidden bg-white ring-1 ring-chocolate/[0.07] flex items-center justify-center transition-shadow duration-700 group-hover:shadow-[0_16px_30px_-18px_rgba(58,42,33,0.45)]'>
                            {industria.foto ? (
                                <img
                                    src={industria.foto}
                                    alt={industria.nome}
                                    loading='lazy'
                                    className='w-full h-full object-cover grayscale opacity-75 transition duration-700 group-hover:grayscale-0 group-hover:opacity-100'
                                />
                            ) : (
                                <Building2 size='1.625rem' strokeWidth={1.25} className='text-gold/60' />
                            )}
                        </div>

                        <p className='text-[0.625rem] font-medium uppercase tracking-[0.14em] text-cocoa text-center leading-tight line-clamp-2 w-full'>
                            {industria.nome}
                        </p>

                    </div>
                ))}
            </Reveal>

            <SectionAction link='/industrias'>Conhecer as marcas</SectionAction>

        </section>
    );
}
