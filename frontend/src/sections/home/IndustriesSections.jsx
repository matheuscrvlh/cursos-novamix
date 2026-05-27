import { Building2 } from 'lucide-react';

export default function IndustriesSections({ industrias }) {
    return (
        <section className='md:w-[80vw] md:mx-auto mt-20 mb-10 px-6 md:px-0'>

            {/* TÍTULO */}
            <p className='text-lg font-bold text-gray-dark md:text-3xl mb-8'>
                INDÚSTRIAS PARCEIRAS
            </p>

            {/* LOGO GRID */}
            <div className='flex flex-wrap justify-center gap-5'>
                {industrias.slice(0, 16).map((industria, i) => (
                    <div key={i} className='flex flex-col items-center gap-2 w-24 md:w-28'>

                        {/* Logo */}
                        <div className='w-18 h-18 md:w-20 md:h-20 rounded-xl overflow-hidden bg-white shadow-sm flex items-center justify-center border border-gray-base/10'>
                            {industria.foto ? (
                                <img
                                    src={industria.foto}
                                    alt={industria.nome}
                                    className='w-full h-full object-cover'
                                />
                            ) : (
                                <Building2 size={28} className='text-gray-base/40' />
                            )}
                        </div>

                        {/* Nome */}
                        <p className='text-xs font-semibold text-gray-dark text-center leading-tight line-clamp-2 w-full'>
                            {industria.nome}
                        </p>

                    </div>
                ))}
            </div>

        </section>
    );
}
