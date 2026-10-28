import { useState } from 'react'
import { ArrowUp } from 'lucide-react'

import { rolarPara } from '../../utils/rolagemSuave'

// Voltar ao topo: no hover (ou no foco pelo teclado), a bolinha de chocolate
// vira um brigadeiro 3D girando; no clique ele dá um pulinho enquanto a página
// sobe. No celular, sem hover, é o toque que faz ele aparecer.
//
// O brigadeiro é desenho próprio, modelado e renderizado em 3D (three.js) fora
// do site: uma volta em 48 quadros numa tira de imagem (assets/images/brigadeiro),
// passada quadro a quadro pelo CSS (index.css, .brigadeiro). O site não carrega
// biblioteca 3D nenhuma, e a imagem só é baixada quando o botão aparece.
// acimaDaBarra: a página tem a barra fixa de inscrição embaixo (celular, página
// do curso), e o botão sobe pra não ficar em cima dela
export default function BotaoTopo({ visivel, acimaDaBarra }) {
    const [pulando, setPulando] = useState(false)
    // o brigadeiro continua no lugar da bolinha até o botão terminar de sumir
    // (senão ela reaparecia, apagada, no meio do fade)
    const [docinho, setDocinho] = useState(false)
    // a página sobe rápido e o botão sumiria antes do pulinho: fica até ele acabar
    const naTela = visivel || pulando

    function terminarPulo() {
        setPulando(false)
        setTimeout(() => setDocinho(false), 600)
    }

    return (
        <button
            onClick={() => { setPulando(true); setDocinho(true); rolarPara(0) }}
            aria-label='Voltar ao topo'
            title='Voltar ao topo'
            tabIndex={naTela ? 0 : -1}
            data-docinho={docinho || undefined}
            className={`group fixed right-4 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 flex items-center justify-center text-cream cursor-pointer transition duration-500 ease-luxo
                ${acimaDaBarra ? 'bottom-24 lg:bottom-8' : 'bottom-5 md:bottom-8'}
                ${naTela ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
        >
            {/* a bolinha de sempre: encolhe e some quando o brigadeiro entra */}
            <span className='absolute inset-0 rounded-full bg-chocolate shadow-[0_12px_30px_-10px_rgba(58,42,33,0.6)] transition duration-500 ease-luxo group-hover:scale-50 group-hover:opacity-0 group-focus-visible:scale-50 group-focus-visible:opacity-0 group-data-docinho:scale-50 group-data-docinho:opacity-0' />
            <ArrowUp size='1.125rem' strokeWidth={1.5} className='relative transition duration-300 ease-luxo group-hover:-translate-y-2 group-hover:opacity-0 group-focus-visible:-translate-y-2 group-focus-visible:opacity-0 group-data-docinho:-translate-y-2 group-data-docinho:opacity-0' />

            {/* o brigadeiro entra passando um pouco do tamanho; dentro, o pulinho
                do clique e, por último, a volta em 3D */}
            <span className='pointer-events-none absolute left-1/2 top-1/2 w-13 h-13 md:w-14 md:h-14 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-40 transition duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:opacity-100 group-hover:scale-100 group-focus-visible:opacity-100 group-focus-visible:scale-100 group-data-docinho:opacity-100 group-data-docinho:scale-100'>
                <span
                    className={`block w-full h-full origin-bottom ${pulando ? 'animate-brigadeiro-pulo' : ''}`}
                    onAnimationEnd={e => { if (e.animationName === 'brigadeiro-pulo') terminarPulo() }}
                >
                    <span className={`block w-full h-full drop-shadow-[0_8px_8px_rgba(58,42,33,0.3)] ${naTela || docinho ? 'brigadeiro' : ''}`} />
                </span>
            </span>
        </button>
    )
}
