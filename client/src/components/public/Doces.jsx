import { useId } from 'react'

// Ilustrações dos doces da seção do ateliê (desenho próprio, sem foto de banco
// de imagem). Cada uma tem os próprios degradês, então os ids vêm do useId —
// com o mesmo id repetido na página, o navegador usa o primeiro e um doce
// escondido (ex: só no desktop) apagava o degradê dos outros

function useIdSvg() {
    return useId().replace(/[^a-zA-Z0-9_-]/g, '')
}

const SABORES = {
    framboesa: { clara: '#FCD7DF', casca: '#F2A5B5', escura: '#D77890', pe: '#E58FA2', recheio: '#FFF5F1', recheioSombra: '#EFD9D2' },
    pistache:  { clara: '#E7F0D4', casca: '#C0D69C', escura: '#93B06A', pe: '#A8C37E', recheio: '#FFFBEF', recheioSombra: '#ECE4CC' },
    baunilha:  { clara: '#FFF7E1', casca: '#F2E0B4', escura: '#D6BB80', pe: '#E4CC95', recheio: '#7A4A2B', recheioSombra: '#55301A' },
    lavanda:   { clara: '#EEE6F8', casca: '#CAB7E6', escura: '#9D85C7', pe: '#B39DD6', recheio: '#FFF8F2', recheioSombra: '#EADBD2' },
    chocolate: { clara: '#BC8E6C', casca: '#8B5B3C', escura: '#5B3721', pe: '#71482D', recheio: '#F6E7D2', recheioSombra: '#E0CAAE' },
}

// faixa com a borda de baixo (ou de cima) ondulada — o "pé" rendado do macaron
function babado(xa, xb, y, altura, ondas, ondulaEmBaixo) {
    const passo = (xb - xa) / ondas
    const meio = ondulaEmBaixo ? y + altura * 0.55 : y + altura * 0.45
    let d = ondulaEmBaixo
        ? `M${xa},${y} L${xb},${y} L${xb},${meio}`
        : `M${xa},${y + altura} L${xb},${y + altura} L${xb},${meio}`
    for (let i = ondas; i > 0; i--) {
        const ponta = ondulaEmBaixo ? y + altura : y
        d += ` Q${(xa + (i - 0.5) * passo).toFixed(1)},${ponta} ${(xa + (i - 1) * passo).toFixed(1)},${meio}`
    }
    return d + ' Z'
}

export function Macaron({ sabor = 'framboesa', className = '', style }) {
    const id = useIdSvg()
    const c = SABORES[sabor]

    return (
        <svg viewBox='0 0 120 96' className={className} style={style} aria-hidden='true'>
            <defs>
                <linearGradient id={`${id}-topo`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0' stopColor={c.clara} />
                    <stop offset='0.55' stopColor={c.casca} />
                    <stop offset='1' stopColor={c.escura} />
                </linearGradient>
                <linearGradient id={`${id}-base`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0' stopColor={c.casca} />
                    <stop offset='1' stopColor={c.escura} />
                </linearGradient>
                <linearGradient id={`${id}-recheio`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0' stopColor={c.recheio} />
                    <stop offset='1' stopColor={c.recheioSombra} />
                </linearGradient>
            </defs>

            <path d='M15,49 C15,46.5 105,46.5 105,49 L105,59 C105,61.5 15,61.5 15,59 Z' fill={`url(#${id}-recheio)`} />
            <path d='M12,64 L108,64 C108,77 86,84 60,84 C34,84 12,77 12,64 Z' fill={`url(#${id}-base)`} />
            <path d={babado(10, 110, 57, 9, 16, false)} fill={c.pe} />
            <path d={babado(10, 110, 42, 9, 16, true)} fill={c.pe} />
            <path d='M12,44 C12,22 34,12 60,12 C86,12 108,22 108,44 Z' fill={`url(#${id}-topo)`} />

            <ellipse cx='42' cy='24' rx='17' ry='5' transform='rotate(-10 42 24)' fill='#fff' opacity='0.45' />
            <ellipse cx='40' cy='73' rx='12' ry='2.4' fill='#fff' opacity='0.18' />
        </svg>
    )
}

const SEMENTES_MORANGO = [
    [30, 44, -20], [44, 43, -8], [58, 43, 8], [72, 44, 20],
    [23, 56, -24], [37, 55, -10], [51, 55, 0], [65, 55, 10], [78, 56, 24],
    [29, 68, -18], [43, 67, -6], [57, 67, 6], [71, 68, 18],
    [36, 80, -14], [50, 80, 0], [63, 80, 14],
    [44, 91, -8], [56, 91, 8],
]

export function Morango({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 100 112' className={className} style={style} aria-hidden='true'>
            <defs>
                <radialGradient id={`${id}-corpo`} cx='0.4' cy='0.42' r='0.7'>
                    <stop offset='0' stopColor='#FF6B6B' />
                    <stop offset='0.45' stopColor='#E5383B' />
                    <stop offset='1' stopColor='#A8142A' />
                </radialGradient>
                <linearGradient id={`${id}-folha`} x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='0' stopColor='#7CC46A' />
                    <stop offset='1' stopColor='#2E6B3F' />
                </linearGradient>
            </defs>

            <path
                d='M50,106 C33,98 13,76 11,54 C9,36 22,25 37,27 C43,28 47,30 50,32 C53,30 57,28 63,27 C78,25 91,36 89,54 C87,76 67,98 50,106 Z'
                fill={`url(#${id}-corpo)`}
            />
            <ellipse cx='31' cy='52' rx='6' ry='14' transform='rotate(-20 31 52)' fill='#fff' opacity='0.2' />

            {SEMENTES_MORANGO.map(([x, y, r], i) => (
                <g key={i} transform={`rotate(${r} ${x} ${y})`}>
                    <ellipse cx={x + 0.5} cy={y + 0.7} rx='1.9' ry='3' fill='#8E1022' opacity='0.35' />
                    <ellipse cx={x} cy={y} rx='1.5' ry='2.6' fill='#FFE29A' />
                </g>
            ))}

            <g fill={`url(#${id}-folha)`}>
                <path d='M50,31 C42,30 30,30 19,36 C30,38 42,36 50,34 Z' />
                <path d='M50,31 C58,30 70,30 81,36 C70,38 58,36 50,34 Z' />
                <path d='M50,31 C44,26 36,18 26,15 C32,24 42,30 50,33 Z' />
                <path d='M50,31 C56,26 64,18 74,15 C68,24 58,30 50,33 Z' />
                <path d='M50,32 C44,38 38,46 35,53 C44,47 48,40 50,35 Z' />
                <path d='M50,32 C56,38 62,46 65,53 C56,47 52,40 50,35 Z' />
            </g>
            <path d='M50,31 C50,22 53,13 58,6' fill='none' stroke='#4E7D36' strokeWidth='3.2' strokeLinecap='round' />
        </svg>
    )
}

const BAGOS_FRAMBOESA = [
    { y: 24, r: 8, xs: [37, 50, 63] },
    { y: 35, r: 8.6, xs: [29.5, 43.5, 57.5, 71.5] },
    { y: 47.5, r: 9, xs: [22, 36, 50, 64, 78] },
    { y: 60, r: 9, xs: [29, 43, 57, 71] },
    { y: 72, r: 8.6, xs: [36, 50, 64] },
    { y: 83, r: 8, xs: [43, 57] },
    { y: 92, r: 6.5, xs: [50] },
]

export function Framboesa({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 100 104' className={className} style={style} aria-hidden='true'>
            <defs>
                <radialGradient id={`${id}-bago`} cx='0.35' cy='0.3' r='0.75'>
                    <stop offset='0' stopColor='#FF8FA3' />
                    <stop offset='0.55' stopColor='#D1495B' />
                    <stop offset='1' stopColor='#8E2443' />
                </radialGradient>
            </defs>

            {BAGOS_FRAMBOESA.map(linha => linha.xs.map(x => (
                <g key={`${linha.y}-${x}`}>
                    <circle cx={x} cy={linha.y} r={linha.r} fill={`url(#${id}-bago)`} />
                    <circle cx={x - 2.8} cy={linha.y - 3} r='2' fill='#fff' opacity='0.5' />
                </g>
            )))}

            <g fill='#4F8A3C'>
                <path d='M50,17 C44,11 36,11 30,15 C38,17 44,19 50,20 Z' />
                <path d='M50,17 C56,11 64,11 70,15 C62,17 56,19 50,20 Z' />
            </g>
            <path d='M50,17 C50,11 52,6 56,3' fill='none' stroke='#4E7D36' strokeWidth='2.4' strokeLinecap='round' />
        </svg>
    )
}

export function Folha({ className = '', style }) {
    const id = useIdSvg()
    const nervuras = [
        'M50.5,30 Q60,32 67,26', 'M51,46 Q64,50 75,44', 'M51.5,62 Q64,68 74,64', 'M52,78 Q62,84 68,82',
        'M50.5,30 Q41,33 34,28', 'M51,46 Q38,50 27,46', 'M51.5,62 Q38,68 29,66', 'M52,78 Q42,84 36,84',
    ]

    return (
        <svg viewBox='0 0 100 124' className={className} style={style} aria-hidden='true'>
            <defs>
                <linearGradient id={`${id}-folha`} x1='0.2' y1='0' x2='0.8' y2='1'>
                    <stop offset='0' stopColor='#8AD278' />
                    <stop offset='1' stopColor='#2F7A4E' />
                </linearGradient>
            </defs>

            <path d='M50,6 C78,24 88,66 52,114 C12,70 22,26 50,6 Z' fill={`url(#${id}-folha)`} />
            <path d='M50,12 C51,44 52,78 52,110' fill='none' stroke='#DDF3D3' strokeWidth='2.2' strokeLinecap='round' opacity='0.75' />
            {nervuras.map(d => (
                <path key={d} d={d} fill='none' stroke='#DDF3D3' strokeWidth='1.3' strokeLinecap='round' opacity='0.55' />
            ))}
            <path d='M52,112 C53,116 52,120 49,123' fill='none' stroke='#2F6B3F' strokeWidth='2.4' strokeLinecap='round' />
        </svg>
    )
}

export function Cereja({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 110 112' className={className} style={style} aria-hidden='true'>
            <defs>
                <radialGradient id={`${id}-fruta`} cx='0.32' cy='0.28' r='0.8'>
                    <stop offset='0' stopColor='#FF5C6C' />
                    <stop offset='0.55' stopColor='#C8102E' />
                    <stop offset='1' stopColor='#6D0518' />
                </radialGradient>
                <linearGradient id={`${id}-folha`} x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0' stopColor='#8AD278' />
                    <stop offset='1' stopColor='#2F7A4E' />
                </linearGradient>
            </defs>

            <g fill='none' stroke='#6B4423' strokeWidth='3' strokeLinecap='round'>
                <path d='M36,62 C38,42 54,22 72,10' />
                <path d='M75,69 C75,48 73,28 72,10' />
            </g>
            <path d='M72,10 C82,0 100,2 106,12 C94,18 80,18 72,10 Z' fill={`url(#${id}-folha)`} />
            <path d='M73,10 C84,10 96,11 105,12' fill='none' stroke='#DDF3D3' strokeWidth='1.2' opacity='0.6' />

            <circle cx='34' cy='80' r='21' fill={`url(#${id}-fruta)`} />
            <circle cx='76' cy='87' r='20' fill={`url(#${id}-fruta)`} />
            <ellipse cx='26' cy='72' rx='6' ry='3.8' transform='rotate(-30 26 72)' fill='#fff' opacity='0.45' />
            <ellipse cx='68' cy='79' rx='5.5' ry='3.5' transform='rotate(-30 68 79)' fill='#fff' opacity='0.45' />
            <g fill='none' stroke='#6D0518' strokeWidth='1.5' strokeLinecap='round' opacity='0.5'>
                <path d='M31,61 Q35,64 39,61' />
                <path d='M71,69 Q75,72 79,69' />
            </g>
        </svg>
    )
}

export function Bombom({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 100 100' className={className} style={style} aria-hidden='true'>
            <defs>
                <radialGradient id={`${id}-choco`} cx='0.32' cy='0.28' r='0.8'>
                    <stop offset='0' stopColor='#A1704D' />
                    <stop offset='0.55' stopColor='#5E3721' />
                    <stop offset='1' stopColor='#2A160B' />
                </radialGradient>
                <linearGradient id={`${id}-ouro`} x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0' stopColor='#F1DC9C' />
                    <stop offset='1' stopColor='#B8975A' />
                </linearGradient>
                <clipPath id={`${id}-esfera`}>
                    <circle cx='50' cy='54' r='36' />
                </clipPath>
            </defs>

            <circle cx='50' cy='54' r='36' fill={`url(#${id}-choco)`} />
            <path
                d='M14,44 C22,32 27,56 35,44 C43,32 47,56 55,44 C63,32 67,56 75,44 C80,37 84,40 88,44'
                fill='none' stroke='#EAD6B4' strokeWidth='3.4' strokeLinecap='round'
                clipPath={`url(#${id}-esfera)`}
            />
            <ellipse cx='37' cy='38' rx='9' ry='5' transform='rotate(-35 37 38)' fill='#fff' opacity='0.22' />
            <path d='M55,21 L62,19 L64,25 L58,28 Z' fill={`url(#${id}-ouro)`} />
        </svg>
    )
}

export function Brilho({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 40 40' className={className} style={style} aria-hidden='true'>
            <defs>
                <linearGradient id={`${id}-ouro`} x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0' stopColor='#F1DC9C' />
                    <stop offset='1' stopColor='#B8975A' />
                </linearGradient>
            </defs>
            <path d='M20,0 C21.5,13 27,18.5 40,20 C27,21.5 21.5,27 20,40 C18.5,27 13,21.5 0,20 C13,18.5 18.5,13 20,0 Z' fill={`url(#${id}-ouro)`} />
        </svg>
    )
}

// ---------- prato (visto de cima) ----------

function MacaronDeCima({ id, x, y, r, sabor }) {
    const c = SABORES[sabor]
    return (
        <g>
            <circle cx={x} cy={y + 10} r={r * 1.02} fill='#3A2A21' opacity='0.18' filter={`url(#${id}-desfoque-doce)`} />
            {/* o "pé" rendado aparecendo em volta da casca — é o que faz ler
                "macaron" de cima, e não bolinha */}
            <circle cx={x} cy={y} r={r + 3} fill={c.pe} />
            <circle cx={x} cy={y} r={r + 3} fill='none' stroke={c.pe} strokeWidth='7' strokeDasharray='0.1 6.2' strokeLinecap='round' />
            <circle cx={x} cy={y} r={r + 1} fill='none' stroke={c.escura} strokeWidth='2' strokeDasharray='0.1 4.4' strokeLinecap='round' opacity='0.45' />
            {/* casca achatada: degradê suave, sem o brilho forte de esfera */}
            <circle cx={x} cy={y} r={r - 1} fill={`url(#${id}-mac-${sabor})`} />
            <circle cx={x} cy={y} r={r - 1} fill='none' stroke={c.escura} strokeWidth='1.2' opacity='0.35' />
            <ellipse cx={x - r * 0.22} cy={y - r * 0.3} rx={r * 0.46} ry={r * 0.2} transform={`rotate(-24 ${x - r * 0.22} ${y - r * 0.3})`} fill='#fff' opacity='0.28' />
        </g>
    )
}

function FramboesaDeCima({ id, x, y, r }) {
    const anel = (n, raio, tam) => Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2
        return [x + Math.cos(a) * raio, y + Math.sin(a) * raio, tam]
    })
    const bagos = [...anel(10, r * 0.78, r * 0.3), ...anel(6, r * 0.42, r * 0.3)]
    return (
        <g>
            <circle cx={x} cy={y + 6} r={r} fill='#3A2A21' opacity='0.18' filter={`url(#${id}-desfoque-doce)`} />
            {bagos.map(([bx, by, br], i) => (
                <g key={i}>
                    <circle cx={bx} cy={by} r={br} fill={`url(#${id}-bago)`} />
                    <circle cx={bx - br * 0.35} cy={by - br * 0.35} r={br * 0.28} fill='#fff' opacity='0.5' />
                </g>
            ))}
            <circle cx={x} cy={y} r={r * 0.2} fill='#6E1A30' />
        </g>
    )
}

function FolhaDeCima({ id, x, y, tamanho, rotacao }) {
    const s = tamanho / 120
    return (
        <g transform={`translate(${x} ${y}) rotate(${rotacao}) scale(${s}) translate(-50 -60)`}>
            <path d='M50,6 C78,24 88,66 52,114 C12,70 22,26 50,6 Z' fill={`url(#${id}-folha)`} />
            <path d='M50,12 C51,44 52,78 52,110' fill='none' stroke='#DDF3D3' strokeWidth='2.4' opacity='0.7' />
        </g>
    )
}

export function PratoDeDoces({ className = '', style }) {
    const id = useIdSvg()

    return (
        <svg viewBox='0 0 800 800' className={className} style={style} aria-hidden='true'>
            <defs>
                <radialGradient id={`${id}-porcelana`} cx='0.5' cy='0.5' r='0.5'>
                    <stop offset='0' stopColor='#FFFFFF' />
                    <stop offset='0.7' stopColor='#FFFFFF' />
                    <stop offset='0.8' stopColor='#F5EFE7' />
                    <stop offset='0.87' stopColor='#FFFFFF' />
                    <stop offset='0.97' stopColor='#F0E8DC' />
                    <stop offset='1' stopColor='#E4D9C8' />
                </radialGradient>
                <radialGradient id={`${id}-fundo`} cx='0.45' cy='0.4' r='0.6'>
                    <stop offset='0' stopColor='#FFFFFF' />
                    <stop offset='1' stopColor='#F4EEE5' />
                </radialGradient>
                <linearGradient id={`${id}-calda`} x1='0' y1='0' x2='1' y2='0'>
                    <stop offset='0' stopColor='#3B2214' />
                    <stop offset='0.5' stopColor='#5A3420' />
                    <stop offset='1' stopColor='#3B2214' />
                </linearGradient>
                <radialGradient id={`${id}-bago`} cx='0.35' cy='0.3' r='0.75'>
                    <stop offset='0' stopColor='#FF8FA3' />
                    <stop offset='0.55' stopColor='#D1495B' />
                    <stop offset='1' stopColor='#8E2443' />
                </radialGradient>
                <linearGradient id={`${id}-folha`} x1='0.2' y1='0' x2='0.8' y2='1'>
                    <stop offset='0' stopColor='#8AD278' />
                    <stop offset='1' stopColor='#2F7A4E' />
                </linearGradient>
                <linearGradient id={`${id}-ouro`} x1='0' y1='0' x2='1' y2='1'>
                    <stop offset='0' stopColor='#F1DC9C' />
                    <stop offset='1' stopColor='#B8975A' />
                </linearGradient>
                {['framboesa', 'pistache', 'lavanda'].map(sabor => (
                    <radialGradient key={sabor} id={`${id}-mac-${sabor}`} cx='0.42' cy='0.38' r='0.68'>
                        <stop offset='0' stopColor={SABORES[sabor].clara} />
                        <stop offset='0.45' stopColor={SABORES[sabor].casca} />
                        <stop offset='0.92' stopColor={SABORES[sabor].casca} />
                        <stop offset='1' stopColor={SABORES[sabor].escura} />
                    </radialGradient>
                ))}
                <filter id={`${id}-desfoque`} x='-20%' y='-20%' width='140%' height='140%'>
                    <feGaussianBlur stdDeviation='16' />
                </filter>
                <filter id={`${id}-desfoque-doce`} x='-30%' y='-30%' width='160%' height='160%'>
                    <feGaussianBlur stdDeviation='6' />
                </filter>
            </defs>

            {/* prato: sombra, porcelana, filete dourado e o fundo */}
            <circle cx='400' cy='414' r='380' fill='#3A2A21' opacity='0.16' filter={`url(#${id}-desfoque)`} />
            <circle cx='400' cy='400' r='384' fill={`url(#${id}-porcelana)`} />
            <circle cx='400' cy='400' r='352' fill='none' stroke='#B8975A' strokeWidth='1.6' opacity='0.6' />
            <circle cx='400' cy='400' r='344' fill='none' stroke='#B8975A' strokeWidth='0.8' opacity='0.35' />
            <circle cx='400' cy='400' r='292' fill='none' stroke='#3A2A21' strokeWidth='10' opacity='0.05' />
            <circle cx='400' cy='400' r='286' fill={`url(#${id}-fundo)`} />
            <circle cx='400' cy='400' r='286' fill='none' stroke='#fff' strokeWidth='2' opacity='0.9' />

            {/* calda de chocolate em pincelada, terminando em gotas */}
            <path d='M228,372 C296,300 468,280 574,320' fill='none' stroke={`url(#${id}-calda)`} strokeWidth='24' strokeLinecap='round' />
            <path d='M250,366 C320,312 460,298 556,330' fill='none' stroke='#8A5A3B' strokeWidth='3' strokeLinecap='round' opacity='0.35' />
            {[[598, 336, 9], [616, 350, 6.5], [629, 365, 4.5], [638, 379, 3]].map(([cx, cy, r]) => (
                <circle key={cx} cx={cx} cy={cy} r={r} fill='#3B2214' />
            ))}

            <FolhaDeCima id={id} x={590} y={262} tamanho={74} rotacao={38} />
            <FolhaDeCima id={id} x={262} y={258} tamanho={58} rotacao={-52} />

            <MacaronDeCima id={id} x={318} y={330} r={68} sabor='framboesa' />
            <MacaronDeCima id={id} x={472} y={312} r={60} sabor='pistache' />
            <MacaronDeCima id={id} x={400} y={420} r={58} sabor='lavanda' />

            <FramboesaDeCima id={id} x={232} y={424} r={26} />
            <FramboesaDeCima id={id} x={556} y={414} r={24} />
            <FramboesaDeCima id={id} x={520} y={462} r={19} />
            <FolhaDeCima id={id} x={214} y={470} tamanho={52} rotacao={-118} />

            {/* folhas de ouro e farelos de chocolate */}
            {[[334, 300, 0], [486, 290, 40], [408, 400, 75]].map(([x, y, r]) => (
                <path key={x} d='M0,0 L9,-3 L12,5 L4,9 Z' transform={`translate(${x} ${y}) rotate(${r})`} fill={`url(#${id}-ouro)`} />
            ))}
            {[[292, 298, 3], [612, 300, 2.5], [524, 358, 2], [358, 486, 3], [468, 474, 2], [258, 336, 2]].map(([cx, cy, r]) => (
                <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} fill='#5A3420' opacity='0.8' />
            ))}
        </svg>
    )
}
