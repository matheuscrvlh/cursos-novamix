import { Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

export default function IndustryCard({
    id,
    foto,
    razaoSocial,
    nome,
    cnpj,
    telefone,
    email,
    site,
    endereco,
    instagram,
}) {
    return (
        <div className='bg-white rounded-xl flex flex-col shadow-md hover:shadow-lg transition-shadow overflow-hidden w-full'>

            {/* IMAGEM com overlay */}
            <div className='relative h-44 overflow-hidden'>
                {foto ? (
                    <img src={foto} alt={nome} className='w-full h-full object-cover' />
                ) : (
                    <div className='w-full h-full bg-gray-base/10 flex items-center justify-center'>
                        <Building2 size={40} className='text-gray-base/30' />
                    </div>
                )}

                {/* Gradient */}
                <div className='absolute inset-0 bg-linear-to-t from-black/65 via-black/20 to-transparent' />

                {/* Nome + razao social na base */}
                <div className='absolute bottom-0 left-0 right-0 p-3'>
                    <p className='text-white font-bold text-base leading-tight'>{nome}</p>
                    {razaoSocial && razaoSocial !== nome && (
                        <p className='text-white/70 text-xs mt-0.5 truncate'>{razaoSocial}</p>
                    )}
                </div>
            </div>

            {/* INFOS */}
            <div className='p-4 flex flex-col gap-2 flex-1'>

                {telefone && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <Phone size={13} className='shrink-0 text-orange-base' />
                        <span>{telefone}</span>
                    </div>
                )}

                {email && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <Mail size={13} className='shrink-0 text-orange-base' />
                        <span className='truncate'>{email}</span>
                    </div>
                )}

                {endereco && (
                    <div className='flex items-center gap-2 text-xs text-gray-text/70'>
                        <MapPin size={13} className='shrink-0 text-orange-base' />
                        <span className='truncate'>{endereco}</span>
                    </div>
                )}

                {site && (
                    <div className='flex items-center gap-2 text-xs mt-auto pt-1'>
                        <Globe size={13} className='shrink-0 text-blue-base' />
                        <a
                            href={site}
                            target='_blank'
                            rel='noreferrer'
                            className='text-blue-base truncate hover:underline'
                        >
                            {site}
                        </a>
                    </div>
                )}

            </div>
        </div>
    );
}
