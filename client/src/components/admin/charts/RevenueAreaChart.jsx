import { useId, useState } from 'react'
import { formatarPreco } from '../../../utils/formatCurrency'

const COR = '#EA8006' // orange-base
const W = 640
const H = 220
const PAD = { top: 16, right: 16, bottom: 28, left: 16 }

function ticksAmigaveis(max) {
    if (max <= 0) return [0]
    const passo = Math.pow(10, Math.floor(Math.log10(max)))
    const passoArredondado = max / passo <= 2 ? passo / 2 : max / passo <= 5 ? passo : passo * 2
    const topo = Math.ceil(max / passoArredondado) * passoArredondado
    const ticks = []
    for (let v = 0; v <= topo; v += passoArredondado) ticks.push(v)
    return ticks
}

export default function RevenueAreaChart({ data }) {
    const gradId = useId()
    const [hover, setHover] = useState(null)

    const max = Math.max(1, ...data.map(d => d.value))
    const ticks = ticksAmigaveis(max)
    const topo = ticks[ticks.length - 1]

    const plotW = W - PAD.left - PAD.right
    const plotH = H - PAD.top - PAD.bottom

    const x = i => PAD.left + (data.length === 1 ? plotW / 2 : (i / (data.length - 1)) * plotW)
    const y = v => PAD.top + plotH - (v / topo) * plotH

    const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
    const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD.top + plotH} L ${x(0)} ${PAD.top + plotH} Z`

    function handleMove(e) {
        const rect = e.currentTarget.getBoundingClientRect()
        const px = ((e.clientX - rect.left) / rect.width) * W
        let nearest = 0
        let dist = Infinity
        data.forEach((_, i) => {
            const d = Math.abs(x(i) - px)
            if (d < dist) { dist = d; nearest = i }
        })
        setHover(nearest)
    }

    const hovered = hover != null ? data[hover] : null

    return (
        <div className='relative'>
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className='w-full h-auto'
                onMouseMove={handleMove}
                onMouseLeave={() => setHover(null)}
            >
                <defs>
                    <linearGradient id={gradId} x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor={COR} stopOpacity='0.12' />
                        <stop offset='100%' stopColor={COR} stopOpacity='0' />
                    </linearGradient>
                </defs>

                {ticks.map(t => (
                    <g key={t}>
                        <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke='#E5E5E5' strokeWidth='1' />
                        <text x={PAD.left} y={y(t) - 4} fontSize='10' fill='#9CA3AF'>
                            {t >= 1000 ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k` : t}
                        </text>
                    </g>
                ))}

                <path d={areaPath} fill={`url(#${gradId})`} />
                <path d={linePath} fill='none' stroke={COR} strokeWidth='2' strokeLinejoin='round' strokeLinecap='round' />

                {data.map((d, i) => (
                    <g key={d.label}>
                        {(i === data.length - 1 || i === hover) && (
                            <>
                                <circle cx={x(i)} cy={y(d.value)} r='6' fill='#fff' />
                                <circle cx={x(i)} cy={y(d.value)} r='4' fill={COR} />
                            </>
                        )}
                        <text x={x(i)} y={H - 8} fontSize='10' fill='#9CA3AF' textAnchor='middle'>{d.label}</text>
                    </g>
                ))}

                {hover != null && (
                    <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + plotH} stroke='#9CA3AF' strokeWidth='1' strokeDasharray='3 3' />
                )}
            </svg>

            {hovered && (
                <div
                    className='absolute top-2 -translate-x-1/2 bg-gray-dark text-white text-xs rounded-md px-2.5 py-1.5 pointer-events-none shadow-lg whitespace-nowrap'
                    style={{ left: `${(x(hover) / W) * 100}%` }}
                >
                    <p className='font-bold'>R$ {formatarPreco(hovered.value)}</p>
                    <p className='text-white/70'>{hovered.label}</p>
                </div>
            )}
        </div>
    )
}
