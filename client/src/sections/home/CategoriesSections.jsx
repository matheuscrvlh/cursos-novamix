import { Link } from 'react-router-dom'

import { cursos, culinaristas, cursosInfantis, industrias } from '../../assets/images/categorias';

const categorias = [
    { label: 'Cursos', to: '/cursos', img: cursos, alt: 'Cursos' },
    { label: 'Cursos Infantis', to: '/cursosInfantis', img: cursosInfantis, alt: 'Cursos Infantis' },
    { label: 'Culinaristas', to: '/culinaristas', img: culinaristas, alt: 'Culinaristas' },
    { label: 'Indústrias', to: '/industrias', img: industrias, alt: 'Indústrias' },
]

export default function CategoriesSections() {
    return (
        <section className='w-full flex flex-col items-center my-14 md:my-20 px-6'>
            <div className='grid grid-cols-2 gap-8 md:grid-cols-4 md:gap-12'>
                {categorias.map(cat => (
                    <Link key={cat.to} to={cat.to} className='group flex flex-col items-center gap-3'>

                        <div className='
                            w-28 h-28
                            md:w-40 md:h-40
                            rounded-full
                            overflow-hidden
                            bg-orange-base
                            shadow-sm
                            ring-2 ring-transparent ring-offset-3 ring-offset-gray
                            group-hover:ring-orange-base/40
                            group-hover:shadow-md
                            group-hover:scale-102
                            transition-all duration-300
                        '>
                            <img
                                src={cat.img}
                                alt={cat.alt}
                                className='w-full h-full object-cover object-center'
                            />
                        </div>

                        <p className='
                            font-bold text-sm md:text-base text-gray-dark text-center leading-tight
                            transition-colors duration-200
                        '>
                            {cat.label}
                        </p>

                    </Link>
                ))}
            </div>
        </section>
    )
}
