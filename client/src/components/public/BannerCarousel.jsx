import { useEffect, useState } from 'react'

// banners cadastrados no marketing — desktop 1920×480 (4:1) · mobile 425×495.
// No celular só entram os que têm versão mobile: a arte de desktop recortada
// no formato do celular perde o texto pelas bordas. Se nenhum tiver versão
// mobile, o celular mostra a arte de desktop no formato dela, sem recorte.
// Versão mobile que não carrega (arquivo apagado do servidor) também sai da
// lista, em vez de ficar um ícone de imagem quebrada no lugar do banner.
export default function BannerCarousel({ banners, className = '' }) {
    const [mobileComErro, setMobileComErro] = useState([])
    const comMobile = banners.filter(b => b.imagem_mobile && !mobileComErro.includes(b.id))

    return (
        <div className={className}>
            <div className='md:hidden'>
                {comMobile.length > 0
                    ? <Slides
                        banners={comMobile}
                        campo='imagem_mobile'
                        aspecto='aspect-425/495'
                        onErro={b => setMobileComErro(prev => [...prev, b.id])}
                    />
                    : <Slides banners={banners} campo='imagem' aspecto='aspect-4/1' />
                }
            </div>
            <div className='hidden md:block'>
                <Slides banners={banners} campo='imagem' aspecto='aspect-4/1' />
            </div>
        </div>
    )
}

function Slides({ banners, campo, aspecto, onErro }) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (banners.length <= 1) return
        const t = setInterval(() => setIndex(i => (i + 1) % banners.length), 6000)
        return () => clearInterval(t)
    }, [banners.length])

    const atual = index % banners.length

    return (
        <div className={`relative w-full overflow-hidden bg-orange-base ${aspecto}`}>
            {banners.map((b, i) => {
                const visible = i === atual
                // crossfade lento; sem zoom na imagem porque as artes têm texto
                // encostado nas bordas, que o zoom cortaria
                const className = `absolute inset-0 transition-opacity duration-[1400ms] ease-luxo ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`
                // a arte aparece sempre inteira (contain): o quadro tem a proporção
                // do padrão, e uma arte fora dele (ex: 1920×650 ou 2182×480) fica
                // com as sobras preenchidas pela própria arte desfocada, em vez de
                // ser cortada — o quadro em 1920×650 cortava as laterais das artes
                // 1920×480, que são a maioria
                const img = (
                    <>
                        <img src={b[campo]} alt='' aria-hidden='true' loading={i === 0 ? 'eager' : 'lazy'} className='absolute inset-0 w-full h-full object-cover scale-110 blur-2xl opacity-70' />
                        <img
                            src={b[campo]}
                            alt=''
                            loading={i === 0 ? 'eager' : 'lazy'}
                            onError={onErro ? () => onErro(b) : undefined}
                            className='relative w-full h-full object-contain'
                        />
                    </>
                )

                if (!b.link) return <div key={b.id} className={className}>{img}</div>

                // link pro próprio site abre na mesma aba; só link externo abre aba nova
                const externo = /^https?:\/\//.test(b.link) && !b.link.includes(window.location.host)
                return (
                    <a
                        key={b.id}
                        href={b.link}
                        className={className}
                        tabIndex={visible ? 0 : -1}
                        {...(externo ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                        {img}
                    </a>
                )
            })}

            {banners.length > 1 && (
                <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10'>
                    {banners.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setIndex(i)}
                            aria-label={`Banner ${i + 1}`}
                            className={`h-3.5 py-1.5 bg-clip-content rounded-full transition-all duration-700 ease-luxo cursor-pointer ${i === atual ? 'w-10 bg-white' : 'w-5 bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
