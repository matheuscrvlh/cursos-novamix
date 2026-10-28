import { Building2, Phone, Mail, Globe, Instagram, MapPin, ArrowUpRight } from 'lucide-react';

// o cadastro às vezes vem com "-" no lugar de campo vazio
function preenchido(valor) {
    const v = String(valor ?? '').trim();
    return v !== '' && v !== '-';
}

const linkSite = site => /^https?:\/\//i.test(site) ? site : `https://${site}`;
const linkInstagram = insta => /^https?:\/\//i.test(insta) ? insta : `https://instagram.com/${insta.trim().replace(/^@/, '')}`;

// busca da marca na loja online da Novamix (mesmo formato de link dos
// banners). Sem acento: a busca da loja acha mais resultados assim
function linkProdutos(nome) {
    const termo = nome.normalize('NFD').replace(/[̀-ͯ]/g, '');
    return `https://www.lojanovamix.com.br/loja/busca.php?loja=1467539&palavra_busca=${encodeURIComponent(termo)}`;
}

export default function IndustryCard({
    foto,
    razaoSocial,
    nome,
    telefone,
    email,
    site,
    endereco,
    instagram,
}) {
    const contatos = [
        preenchido(site) && { href: linkSite(site), label: 'Site', icone: <Globe size='0.875rem' strokeWidth={1.5} />, externo: true },
        preenchido(instagram) && { href: linkInstagram(instagram), label: 'Instagram', icone: <Instagram size='0.875rem' strokeWidth={1.5} />, externo: true },
        preenchido(telefone) && { href: `tel:${telefone.replace(/\D/g, '')}`, label: `Telefone ${telefone}`, icone: <Phone size='0.875rem' strokeWidth={1.5} /> },
        preenchido(email) && { href: `mailto:${email.trim()}`, label: `E-mail ${email}`, icone: <Mail size='0.875rem' strokeWidth={1.5} /> },
    ].filter(Boolean);

    return (
        <article className='group w-full flex flex-col bg-white rounded-xl ring-1 ring-chocolate/[0.07] overflow-hidden transition duration-700 ease-luxo hover:-translate-y-1 hover:shadow-[0_28px_50px_-28px_rgba(58,42,33,0.45)]'>

            {/* logo inteiro (contain) com respiro — antes era cortado pra
                preencher uma faixa larga e coberto por um degradê com o nome */}
            {/* shrink-0: sem isso a coluna flex do card espremia a área do logo
                em alguns cards e o filete ficava desalinhado entre eles */}
            <div className='aspect-4/3 shrink-0 flex items-center justify-center p-6 md:p-8'>
                {foto ? (
                    <img
                        src={foto}
                        alt={`Logo ${nome}`}
                        loading='lazy'
                        className='max-w-full max-h-full object-contain rounded-md transition-transform duration-[1400ms] ease-luxo group-hover:scale-105'
                    />
                ) : (
                    <Building2 size='2.5rem' strokeWidth={1.25} className='text-gold/50' />
                )}
            </div>

            <div className='flex flex-col items-center text-center gap-1 flex-1 px-4 md:px-5 pt-4 pb-5 border-t border-chocolate/[0.06]'>
                <h2 className='font-serif text-[1.375rem] font-semibold text-chocolate leading-tight'>{nome}</h2>

                {preenchido(razaoSocial) && razaoSocial.trim() !== nome.trim() && (
                    <p className='text-xs text-cocoa line-clamp-1'>{razaoSocial}</p>
                )}

                {preenchido(endereco) && (
                    <p className='flex items-center gap-1 text-xs text-cocoa'>
                        <MapPin size='0.75rem' strokeWidth={1.5} className='shrink-0 text-gold' />
                        <span className='line-clamp-1'>{endereco}</span>
                    </p>
                )}

                {contatos.length > 0 && (
                    <div className='flex gap-2 mt-2'>
                        {contatos.map(c => (
                            <a
                                key={c.label}
                                href={c.href}
                                title={c.label}
                                aria-label={c.label}
                                {...(c.externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                                className='w-8 h-8 flex items-center justify-center rounded-full ring-1 ring-gold/40 text-gold hover:bg-chocolate hover:text-cream hover:ring-chocolate transition-colors duration-500'
                            >
                                {c.icone}
                            </a>
                        ))}
                    </div>
                )}

                <a
                    href={linkProdutos(nome)}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='group/link mt-auto pt-3 inline-flex items-center gap-1.5 text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-orange-base hover:text-chocolate transition-colors duration-500'
                >
                    Ver produtos
                    <ArrowUpRight size='0.875rem' strokeWidth={1.5} className='transition-transform duration-500 ease-luxo group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5' />
                </a>
            </div>
        </article>
    );
}
