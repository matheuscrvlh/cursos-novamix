import { useState } from 'react'

import { MapPin, Clock, Navigation } from 'lucide-react'

import Reveal from '../../components/public/Reveal'
import SectionHeader from '../../components/public/SectionHeader'
import { LOJAS, linkComoChegar } from '../../utils/lojas'

export default function LocationSections() {

    const [active, setActive] = useState('Prado')
    const location = LOJAS[active]

    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 mt-24 md:mt-32'>

            <SectionHeader
                eyebrow='Onde estamos'
                titulo='Visite nossas'
                destaque='lojas'
                descricao='Os cursos acontecem nas lojas Novamix de Nova Friburgo e Teresópolis.'
            />

            <Reveal className='grid bg-white rounded-xl ring-1 ring-chocolate/[0.07] overflow-hidden md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]'>

                <div className='flex flex-col gap-8 p-6 md:p-10'>

                    <div className='flex gap-6 border-b border-chocolate/10'>
                        {Object.entries(LOJAS).map(([key, loja]) => (
                            <button
                                key={key}
                                onClick={() => setActive(key)}
                                className={`relative pb-3 font-serif text-2xl transition-colors duration-500 cursor-pointer
                                    after:absolute after:left-0 after:right-0 after:-bottom-px after:h-px after:bg-orange-base after:origin-left after:transition-transform after:duration-500 after:ease-luxo ${
                                    active === key
                                        ? 'text-chocolate italic after:scale-x-100'
                                        : 'text-cocoa/60 hover:text-chocolate after:scale-x-0'
                                }`}
                            >
                                {loja.cidade}
                            </button>
                        ))}
                    </div>

                    <div className='flex flex-col gap-5'>
                        <div className='flex items-start gap-3.5'>
                            <MapPin size={18} strokeWidth={1.5} className='text-gold shrink-0 mt-0.5' />
                            <div>
                                <p className='text-[10px] font-medium text-cocoa/70 uppercase tracking-[0.25em] mb-1'>Endereço</p>
                                <p className='text-[15px] font-light text-chocolate'>{location.endereco}</p>
                            </div>
                        </div>
                        <div className='flex items-start gap-3.5'>
                            <Clock size={18} strokeWidth={1.5} className='text-gold shrink-0 mt-0.5' />
                            <div>
                                <p className='text-[10px] font-medium text-cocoa/70 uppercase tracking-[0.25em] mb-1'>Horário</p>
                                <p className='text-[15px] font-light text-chocolate'>{location.horario}</p>
                            </div>
                        </div>
                    </div>

                    <a
                        href={linkComoChegar(active)}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='group md:mt-auto flex items-center justify-center gap-3 w-full py-3.5 rounded-full border border-chocolate/20 text-chocolate text-[11px] font-medium uppercase tracking-[0.22em] hover:bg-chocolate hover:text-cream hover:border-chocolate transition-colors duration-500'
                    >
                        <Navigation size={14} strokeWidth={1.5} />
                        Como chegar
                    </a>
                </div>

                <iframe
                    key={active}
                    src={location.mapa}
                    title={`Mapa da loja Novamix ${location.cidade}`}
                    className='w-full h-72 sm:h-80 md:h-full md:min-h-110 border-0 grayscale-[35%] sepia-[12%]'
                    allowFullScreen
                    loading='lazy'
                />

            </Reveal>
        </section>
    )
}
