import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

import Reveal from './Reveal'

// cabeçalho padrão das seções do site: rótulo dourado entre filetes, título
// em serifada com uma palavra de destaque em itálico, e descrição curta
export default function SectionHeader({ eyebrow, titulo, destaque, descricao, as = 'h2', className = '' }) {
    const Titulo = as

    return (
        <Reveal className={`flex flex-col items-center text-center mb-10 md:mb-14 ${className}`}>
            {eyebrow && (
                <p className='flex items-center gap-3 text-[0.6875rem] font-medium uppercase tracking-[0.32em] text-gold'>
                    <span className='h-px w-8 bg-gold/50' />
                    {eyebrow}
                    <span className='h-px w-8 bg-gold/50' />
                </p>
            )}
            <Titulo className='font-serif text-[2.5rem] md:text-[3.5rem] font-bold text-chocolate leading-[1.05] mt-3'>
                {titulo}
                {destaque && <> <em className='italic text-orange-base'>{destaque}</em></>}
            </Titulo>
            {descricao && (
                <p className='text-[0.9375rem] md:text-base font-normal text-cocoa mt-4 max-w-lg'>{descricao}</p>
            )}
        </Reveal>
    )
}

// botão secundário das seções ("Ver agenda completa", "Ver mais"...) —
// vira link quando recebe `link`, senão é um botão com onClick
export function SectionAction({ link, onClick, children, icone = <ArrowRight size='0.875rem' />, className = '' }) {
    const classes = `group inline-flex items-center gap-3 px-7 py-3.5 rounded-full border border-chocolate/20 text-chocolate text-[0.6875rem] font-medium uppercase tracking-[0.22em] hover:bg-chocolate hover:text-cream hover:border-chocolate transition-colors duration-500 cursor-pointer ${className}`
    const conteudo = (
        <>
            {children}
            <span className='transition-transform duration-500 ease-luxo group-hover:translate-x-1'>{icone}</span>
        </>
    )

    return (
        <div className='flex justify-center mt-10 md:mt-12'>
            {link
                ? <Link to={link} className={classes}>{conteudo}</Link>
                : <button onClick={onClick} className={classes}>{conteudo}</button>
            }
        </div>
    )
}
