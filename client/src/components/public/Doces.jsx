import { useId } from 'react'

// Ilustrações de doces (desenho próprio), da saudação de quem chega no site e
// do brilho dourado da seção do ateliê (os doces de lá são fotos recortadas,
// em assets/images/doces). Cada uma tem os próprios degradês, então os ids vêm
// do useId — com o mesmo id repetido na página, o navegador usa o primeiro e um
// doce escondido (ex: só no desktop) apagava o degradê dos outros

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
