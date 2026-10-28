import { User } from 'lucide-react';

import { nomeLoja } from '../../utils/lojas';

export default function CulinarianCard({
    id,
    foto,
    nomeCulinarista,
    lojas,
    className,
}) {
    const duasLojas = Array.isArray(lojas) ? lojas.length === 2 : false;
    const lojaUnica = Array.isArray(lojas) ? lojas[0] : lojas;

    return (
        <div className={`group rounded-xl ring-1 ring-chocolate/[0.07] hover:shadow-[0_28px_50px_-28px_rgba(58,42,33,0.5)] transition-shadow duration-700 overflow-hidden bg-cream-dark ${className || ''}`}>

            <div className='relative h-72 w-full overflow-hidden'>
                {foto ? (
                    <img
                        src={foto}
                        alt={nomeCulinarista}
                        className='w-full h-full object-cover transition-transform duration-[1400ms] ease-luxo group-hover:scale-[1.06]'
                        loading='lazy'
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                        <User size={48} strokeWidth={1.25} className='text-gold/50' />
                    </div>
                )}

                <div className='absolute inset-0 bg-linear-to-t from-chocolate/85 via-chocolate/15 to-transparent' />

                <div className='absolute bottom-0 left-0 right-0 p-5'>
                    <p className='font-serif text-white text-[22px] md:text-[26px] font-bold leading-[1.05] mb-2.5'>{nomeCulinarista}</p>

                    <span className='inline-block text-[9px] font-medium uppercase tracking-[0.22em] px-3 py-1.5 rounded-full bg-white/15 text-white ring-1 ring-white/30 backdrop-blur-sm'>
                        {duasLojas ? 'Prado e Teresópolis' : nomeLoja(lojaUnica)}
                    </span>
                </div>
            </div>

        </div>
    );
}
