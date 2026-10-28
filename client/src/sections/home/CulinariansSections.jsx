import { useState, useEffect, useRef } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

import { bannerCulinarista } from "../../assets/images/banner"

import CulinarianCard from '../../components/public/CulinarianCard'
import BannerCarousel from '../../components/public/BannerCarousel'
import Reveal from '../../components/public/Reveal'
import SectionHeader, { SectionAction } from '../../components/public/SectionHeader'

import { getBanners } from '../../api/banners.services'

// a lista inteira já vem do DadosContext — o "ver mais" só revela os
// próximos na própria home, sem mandar a pessoa pra outra página
const INICIAIS = 4
const POR_CLIQUE = 8

export default function CulinariansSections({
    culinaristas,
    loadingCulinarian
}) {
    const [homeBanners, setHomeBanners] = useState([])
    const [visiveis, setVisiveis]       = useState(INICIAIS)
    const listaRef = useRef(null)

    useEffect(() => {
        getBanners('home').then(data => {
            if (Array.isArray(data) && data.length > 0) {
                setHomeBanners(data.filter(b => b.ativo))
            }
        })
    }, [])

    const restantes = culinaristas.length - visiveis

    function verMenos() {
        setVisiveis(INICIAIS)
        listaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <section className='w-full mt-24 md:mt-32'>

            {/* ========== BANNER — padrão 1920×480 desktop · 425×495 mobile =========== */}
            {homeBanners.length > 0 ? (
                <BannerCarousel banners={homeBanners} />
            ) : (
                <div className='w-full overflow-hidden aspect-425/495 md:aspect-4/1'>
                    <img src={bannerCulinarista} className='w-full h-full object-cover' alt='' />
                </div>
            )}

            {/* scroll-mt: o "ver menos" rola até aqui sem a lista ficar escondida atrás do header fixo */}
            <div ref={listaRef} className='max-w-7xl mx-auto px-5 md:px-8 mt-20 md:mt-28 scroll-mt-24'>
                <SectionHeader
                    eyebrow='Quem ensina'
                    titulo='Culinaristas'
                    destaque='parceiros'
                    descricao='Profissionais que dão os cursos nas nossas lojas.'
                />

                <div className='grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6'>
                    {loadingCulinarian
                        ? [0, 1, 2, 3].map(i => (
                            <div key={i} className='h-72 rounded-xl bg-white ring-1 ring-chocolate/[0.06] animate-pulse' />
                        ))
                        : culinaristas.slice(0, visiveis).map((c, i) => {
                            const card = (
                                <CulinarianCard
                                    id={c.id}
                                    foto={c.foto}
                                    nomeCulinarista={c.nomeCulinarista}
                                    lojas={c.lojas}
                                />
                            )
                            // os 4 primeiros surgem ao rolar até a seção; os que
                            // o "ver mais" abre já estão na tela, então surgem na hora
                            return i < INICIAIS
                                ? <Reveal key={c.id} delay={i * 120}>{card}</Reveal>
                                : <div key={c.id} className='animate-surgir' style={{ animationDelay: `${((i - INICIAIS) % POR_CLIQUE) * 70}ms` }}>{card}</div>
                        })
                    }
                </div>

                {!loadingCulinarian && culinaristas.length > INICIAIS && (
                    restantes > 0 ? (
                        <SectionAction onClick={() => setVisiveis(v => v + POR_CLIQUE)} icone={<ChevronDown size={14} />}>
                            Ver mais culinaristas <span className='opacity-50'>({restantes})</span>
                        </SectionAction>
                    ) : (
                        <SectionAction onClick={verMenos} icone={<ChevronUp size={14} />}>
                            Ver menos
                        </SectionAction>
                    )
                )}
            </div>

        </section>
    )
}
