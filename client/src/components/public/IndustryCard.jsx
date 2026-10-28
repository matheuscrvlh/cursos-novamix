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
        <div className='group bg-white rounded-xl flex flex-col ring-1 ring-chocolate/[0.07] hover:shadow-[0_28px_50px_-28px_rgba(58,42,33,0.45)] transition-shadow duration-700 overflow-hidden w-full'>

            <div className='relative h-44 overflow-hidden'>
                {foto ? (
                    <img src={foto} alt={nome} loading='lazy' className='w-full h-full object-cover transition-transform duration-[1400ms] ease-luxo group-hover:scale-[1.06]' />
                ) : (
                    <div className='w-full h-full bg-gray-base/10 flex items-center justify-center'>
                        <Building2 size='2.5rem' className='text-gray-base/30' />
                    </div>
                )}

                <div className='absolute inset-0 bg-linear-to-t from-chocolate/80 via-chocolate/15 to-transparent' />

                <div className='absolute bottom-0 left-0 right-0 p-3'>
                    <p className='font-serif text-white text-[1.625rem] font-bold leading-none'>{nome}</p>
                    {razaoSocial && razaoSocial !== nome && (
                        <p className='text-white/75 text-[0.6875rem] font-normal mt-1.5 truncate'>{razaoSocial}</p>
                    )}
                </div>
            </div>

            <div className='p-5 flex flex-col gap-2.5 flex-1'>

                {telefone && (
                    <div className='flex items-center gap-2 text-xs font-normal text-cocoa'>
                        <Phone size='0.8125rem' strokeWidth={1.5} className='shrink-0 text-gold' />
                        <span>{telefone}</span>
                    </div>
                )}

                {email && (
                    <div className='flex items-center gap-2 text-xs font-normal text-cocoa'>
                        <Mail size='0.8125rem' strokeWidth={1.5} className='shrink-0 text-gold' />
                        <span className='truncate'>{email}</span>
                    </div>
                )}

                {endereco && (
                    <div className='flex items-center gap-2 text-xs font-normal text-cocoa'>
                        <MapPin size='0.8125rem' strokeWidth={1.5} className='shrink-0 text-gold' />
                        <span className='truncate'>{endereco}</span>
                    </div>
                )}

                {site && (
                    <div className='flex items-center gap-2 text-xs mt-auto pt-1'>
                        <Globe size='0.8125rem' className='shrink-0 text-blue-base' />
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
