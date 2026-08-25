import { useState } from 'react'

const SIZE = 180
const R = 70
const STROKE = 24
const GAP_DEG = 3 // folga entre segmentos (equivalente ao gap de 2px em barras)

function arcPath(cx, cy, r, startDeg, endDeg) {
    const toXY = deg => {
        const rad = ((deg - 90) * Math.PI) / 180
        return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]
    }
    const [x1, y1] = toXY(startDeg)
    const [x2, y2] = toXY(endDeg)
    const largeArc = endDeg - startDeg > 180 ? 1 : 0
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`
}

export default function StatusDonutChart({ data }) {
    const [hover, setHover] = useState(null)
    const total = data.reduce((s, d) => s + d.value, 0)

    const segmentos = data.filter(d => d.value > 0).reduce((acc, d) => {
        const anterior = acc.length ? acc[acc.length - 1].fracaoAcumulada : 0
        const fracaoAcumulada = anterior + (total > 0 ? d.value / total : 0)
        const start = anterior * 360 + GAP_DEG / 2
        const end = Math.max(fracaoAcumulada * 360 - GAP_DEG / 2, start)
        return [...acc, { ...d, start, end, fracaoAcumulada }]
    }, [])

    const cx = SIZE / 2
    const cy = SIZE / 2

    return (
        <div className='flex items-center gap-6 flex-wrap justify-center'>
            <div className='relative shrink-0' style={{ width: SIZE, height: SIZE }}>
                <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
                    {segmentos.map((s, i) => (
                        <path
                            key={s.label}
                            d={arcPath(cx, cy, R, s.start, s.end)}
                            fill='none'
                            stroke={s.color}
                            strokeWidth={hover === i ? STROKE + 4 : STROKE}
                            strokeLinecap='round'
                            style={{ transition: 'stroke-width 0.15s' }}
                            onMouseEnter={() => setHover(i)}
                            onMouseLeave={() => setHover(null)}
                        />
                    ))}
                </svg>
                <div className='absolute inset-0 flex flex-col items-center justify-center pointer-events-none'>
                    <p className='text-2xl font-bold text-gray-dark'>{hover != null ? segmentos[hover].value : total}</p>
                    <p className='text-[10px] text-gray-text/60 uppercase tracking-wider text-center px-2'>
                        {hover != null ? segmentos[hover].label : 'Inscrições'}
                    </p>
                </div>
            </div>

            <div className='flex flex-col gap-2'>
                {data.map(d => {
                    const idx = segmentos.findIndex(s => s.label === d.label)
                    return (
                        <div
                            key={d.label}
                            className='flex items-center gap-2 text-sm cursor-default'
                            onMouseEnter={() => idx >= 0 && setHover(idx)}
                            onMouseLeave={() => setHover(null)}
                        >
                            <span className='w-2.5 h-2.5 rounded-full shrink-0' style={{ backgroundColor: d.color }} />
                            <span className='text-gray-text/70'>{d.label}</span>
                            <span className='font-semibold text-gray-text ml-auto'>{d.value}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
