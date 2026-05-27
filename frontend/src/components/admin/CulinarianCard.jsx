import { User, Building2, Phone, Instagram, BookOpen } from 'lucide-react';

export default function CulinarianCard({
    imagem,
    culinarista,
    industria,
    telefone,
    instagram,
    lojas,
    cursos,
    className,
    onClick
}) {
    const duasLojas = Array.isArray(lojas) ? lojas.length === 2 : false;
    const lojaUnica = Array.isArray(lojas) ? lojas[0] : lojas;
    const semLoja = lojas === 'Nenhuma' || (Array.isArray(lojas) && lojas.length === 0);

    const totalCursos = Array.isArray(cursos) ? cursos.length : (cursos === 'Nenhum' ? 0 : cursos);

    return (
        <div className={`bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-shadow overflow-hidden ${className || ''}`}>

            {/* IMAGEM com overlay */}
            <div className='relative h-48 overflow-hidden'>
                {imagem ? (
                    <img
                        src={imagem}
                        alt={culinarista}
                        className='w-full h-full object-cover'
                    />
                ) : (
                    <div className='w-full h-full bg-gray-base/10 flex items-center justify-center'>
                        <User size={40} className='text-gray-base/30' />
                    </div>
                )}

                {/* Gradient */}
                <div className='absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent' />

                {/* Nome + loja na base da foto */}
                <div className='absolute bottom-0 left-0 right-0 p-3'>
                    <p className='text-white font-bold text-base leading-tight mb-1.5'>{culinarista}</p>

                    {semLoja ? (
                        <span className='text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 text-white'>
                            Sem loja
                        </span>
                    ) : duasLojas ? (
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

            {/* INFOS */}
            <div className='p-3 flex flex-col gap-1.5 flex-1'>

                {industria && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <Building2 size={13} className='shrink-0 text-orange-base' />
                        <span className='truncate'>{industria}</span>
                    </div>
                )}

                {telefone && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <Phone size={13} className='shrink-0 text-orange-base' />
                        <span>{telefone}</span>
                    </div>
                )}

                {instagram && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <Instagram size={13} className='shrink-0 text-orange-base' />
                        <span className='truncate'>{instagram}</span>
                    </div>
                )}

                <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                    <BookOpen size={13} className='shrink-0 text-orange-base' />
                    <span>{totalCursos === 0 ? 'Nenhum curso' : `${totalCursos} curso${totalCursos !== 1 ? 's' : ''}`}</span>
                </div>

            </div>

            {/* BOTÃO */}
            {onClick && (
                <div className='px-3 pb-3'>
                    <button
                        className='bg-orange-base text-white text-xs font-semibold py-2 rounded-lg w-full hover:bg-orange-light transition-all cursor-pointer'
                        onClick={onClick}
                    >
                        Ver detalhes
                    </button>
                </div>
            )}

        </div>
    );
}
