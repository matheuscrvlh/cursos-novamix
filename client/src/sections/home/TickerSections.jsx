import { Link } from 'react-router-dom'

import Ticker from '../../components/public/Ticker'

// faixa que corre com os nomes dos próximos cursos, logo abaixo do prato do
// ateliê (como a faixa verde embaixo do prato no sushibar.framer.website).
// Fundo chocolate: texto pequeno em cima do laranja não teria contraste
export default function TickerSections({ cursos }) {
    // o mesmo curso em duas lojas (ex: "Decoração Natal") aparece uma vez só
    const vistos = new Set()
    const itens = cursos.filter(c => {
        const chave = (c.nomeCurso || '').trim().toLowerCase()
        if (!chave || vistos.has(chave)) return false
        vistos.add(chave)
        return true
    }).slice(0, 12)

    if (itens.length === 0) return null

    return (
        <section aria-label='Próximos cursos' className='relative bg-chocolate py-4 md:py-5'>
            <Ticker
                velocidade={45}
                separador={<span aria-hidden='true' className='text-gold mx-6 md:mx-9 text-[0.625rem]'>✦</span>}
            >
                {itens.map(c => (
                    <Link
                        key={c.id}
                        to={`/curso/${c.id}`}
                        className='text-cream text-[0.75rem] md:text-[0.8125rem] font-medium uppercase tracking-[0.24em] whitespace-nowrap hover:text-gold transition-colors duration-500'
                    >
                        {c.nomeCurso}
                    </Link>
                ))}
            </Ticker>
        </section>
    )
}
