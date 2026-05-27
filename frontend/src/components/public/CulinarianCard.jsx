import { User } from 'lucide-react';

export default function CulinarianCard({
    id,
    foto,
    nomeCulinarista,
    lojas,
}) {
    const duasLojas = Array.isArray(lojas) ? lojas.length === 2 : false;
    const lojaUnica = Array.isArray(lojas) ? lojas[0] : lojas;

    return (
        <div className='rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden'>

            {/* IMAGEM com overlay */}
            <div className='relative h-72 w-full overflow-hidden'>
                {foto ? (
                    <img
                        src={foto}
                        alt={nomeCulinarista}
                        className='w-full h-full object-cover'
                    />
                ) : (
                    <div className='w-full h-full bg-gray-base/10 flex items-center justify-center'>
                        <User size={48} className='text-gray-base/30' />
                    </div>
                )}

                {/* Gradient */}
                <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />

                {/* Nome + loja sobre a imagem */}
                <div className='absolute bottom-0 left-0 right-0 p-4'>
                    <p className='text-white font-bold text-lg leading-tight mb-1.5'>{nomeCulinarista}</p>

                    {duasLojas ? (
                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white backdrop-blur-sm'>
                            Prado e Teresópolis
                        </span>
                    ) : lojaUnica === 'Prado' ? (
                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-base text-white'>
                            Prado
                        </span>
                    ) : (
                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-base text-white'>
                            {lojaUnica}
                        </span>
                    )}
                </div>
            </div>

        </div>
    );
}
