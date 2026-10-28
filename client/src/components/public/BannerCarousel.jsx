import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    const [index, setIndex]     = useState(0)
    const [pausado, setPausado] = useState(false)
    const toqueX = useRef(null)

    const total = banners.length
    const atual = index % total

    // timeout (não interval) refeito a cada troca: depois de um clique na seta
    // ou num indicador, o banner fica os 6s inteiros antes de avançar sozinho.
    // Com o mouse em cima, não avança
    useEffect(() => {
        if (total <= 1 || pausado) return
        const t = setTimeout(() => setIndex(i => (i + 1) % total), 6000)
        return () => clearTimeout(t)
    }, [index, total, pausado])

    const anterior = () => setIndex(i => (i - 1 + total) % total)
    const proximo  = () => setIndex(i => (i + 1) % total)

    // no celular troca arrastando o dedo pro lado
    function fimDoToque(e) {
        if (toqueX.current == null) return
        const dx = e.changedTouches[0].clientX - toqueX.current
        toqueX.current = null
        if (Math.abs(dx) < 40) return
        if (dx > 0) anterior()
        else proximo()
    }

    return (
        <div
            className={`relative w-full overflow-hidden bg-orange-base ${aspecto}`}
            onMouseEnter={() => setPausado(true)}
            onMouseLeave={() => setPausado(false)}
            onTouchStart={e => { toqueX.current = e.touches[0].clientX }}
            onTouchEnd={fimDoToque}
        >
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

            {total > 1 && (
                <>
                    <button
                        onClick={anterior}
                        aria-label='Banner anterior'
                        className='hidden md:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/85 hover:bg-white text-chocolate shadow-[0_8px_24px_-8px_rgba(58,42,33,0.45)] backdrop-blur-sm transition duration-500 ease-luxo hover:scale-105 cursor-pointer'
                    >
                        <ChevronLeft size={22} strokeWidth={1.5} />
                    </button>
                    <button
                        onClick={proximo}
                        aria-label='Próximo banner'
                        className='hidden md:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 lg:w-12 lg:h-12 items-center justify-center rounded-full bg-white/85 hover:bg-white text-chocolate shadow-[0_8px_24px_-8px_rgba(58,42,33,0.45)] backdrop-blur-sm transition duration-500 ease-luxo hover:scale-105 cursor-pointer'
                    >
                        <ChevronRight size={22} strokeWidth={1.5} />
                    </button>
                </>
            )}

            {total > 1 && (
                // fundo escuro translúcido: as linhas brancas sumiam nas artes de fundo branco
                <div className='absolute bottom-3 md:bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 px-3 rounded-full bg-chocolate/30 backdrop-blur-sm'>
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
