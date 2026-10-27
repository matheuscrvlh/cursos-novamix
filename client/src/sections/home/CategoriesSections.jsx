import { Link } from 'react-router-dom'

import Reveal from '../../components/public/Reveal'

import { cursos, culinaristas, cursosInfantis, industrias } from '../../assets/images/categorias';

const categorias = [
    { label: 'Cursos', to: '/cursos', img: cursos, alt: 'Cursos' },
    { label: 'Cursos Infantis', to: '/cursosInfantis', img: cursosInfantis, alt: 'Cursos Infantis' },
    { label: 'Culinaristas', to: '/culinaristas', img: culinaristas, alt: 'Culinaristas' },
    { label: 'Indústrias', to: '/industrias', img: industrias, alt: 'Indústrias' },
]

export default function CategoriesSections() {
    return (
        <section className='w-full flex flex-col items-center my-24 md:my-32 px-5'>
            <div className='grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4 md:gap-14'>
                {categorias.map((cat, i) => (
                    <Reveal key={cat.to} delay={i * 100}>
                        <Link to={cat.to} className='group flex flex-col items-center gap-4'>

                            <div className='
                                w-28 h-28
                                md:w-40 md:h-40
                                rounded-full
                                overflow-hidden
                                bg-cream-dark
                                ring-1 ring-gold/40 ring-offset-4 ring-offset-cream
                                group-hover:ring-gold
                                transition-[box-shadow] duration-700
                            '>
                                <img
                                    src={cat.img}
                                    alt={cat.alt}
                                    className='w-full h-full object-cover object-center transition-transform duration-[1400ms] ease-luxo group-hover:scale-110'
                                />
                            </div>

                            <p className='
                                font-serif text-xl md:text-2xl text-chocolate text-center leading-tight
                                transition-colors duration-500 group-hover:text-orange-base group-hover:italic
                            '>
                                {cat.label}
                            </p>

                        </Link>
                    </Reveal>
                ))}
            </div>
        </section>
    )
}
