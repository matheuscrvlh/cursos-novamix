import CourseCard from "../../components/public/CourseCard";
import Reveal from "../../components/public/Reveal";
import SectionHeader, { SectionAction } from "../../components/public/SectionHeader";

// usada pros cursos normais e pros infantis na home — mostra os 4 próximos
export default function CoursesSections({
    eyebrow,
    titulo,
    destaque,
    descricao,
    link,
    cursosFiltrados,
    loadingCourses,
    loadingVagasPorCurso,
    vagasPorCurso,
    openForm,
    className = '',
}) {
    return (
        <section className={`max-w-7xl mx-auto px-5 md:px-8 ${className}`}>

            <SectionHeader eyebrow={eyebrow} titulo={titulo} destaque={destaque} descricao={descricao} />

            {loadingCourses ? (
                <div className='flex gap-4 overflow-hidden sm:grid sm:grid-cols-2 sm:gap-6 md:grid-cols-3 xl:grid-cols-4'>
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-[80%] shrink-0 sm:w-auto h-112 rounded-xl bg-white ring-1 ring-chocolate/[0.06] animate-pulse ${i === 3 ? 'md:max-xl:hidden' : ''}`} />
                    ))}
                </div>
            ) : cursosFiltrados.length === 0 ? (
                <div className='flex flex-col items-center justify-center text-center py-16 px-6 rounded-xl bg-white ring-1 ring-chocolate/[0.06]'>
                    <p className='font-serif text-2xl font-semibold text-chocolate'>Nenhum curso com inscrição aberta no momento.</p>
                    <p className='text-sm font-normal text-cocoa mt-2'>Novas turmas são divulgadas toda semana, volte em breve.</p>
                </div>
            ) : (
                // celular: carrossel com scroll lateral (o card seguinte aparece
                // pela metade, indicando que dá pra arrastar) · sm+: linhas
                // centralizadas (flex-wrap, não grade), pra quando tem menos
                // cursos que colunas — ex: filtro da loja do cliente deixando
                // 3 — os cards ficarem no meio e não encostados à esquerda.
                // Largura = (100% - espaços entre colunas) / colunas: 2 no sm,
                // 3 do md ao xl (o 4º card some) e 4 a partir do xl
                <div className='
                    flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-px-5 -mx-5 px-5 pb-2 [scrollbar-width:none]
                    sm:flex-wrap sm:justify-center sm:gap-6 sm:overflow-visible sm:mx-0 sm:px-0 sm:pb-0
                '>
                    {cursosFiltrados.slice(0, 4).map((curso, i) => {
                        const vagas = vagasPorCurso[curso.id];

                        return (
                            <Reveal
                                key={curso.id}
                                delay={i * 120}
                                className={`w-[80%] max-w-80 shrink-0 snap-start sm:max-w-none sm:w-[calc(50%-0.75rem)] md:w-[calc(33.333%-1rem)] xl:w-[calc(25%-1.125rem)] ${i === 3 ? 'md:max-xl:hidden' : ''}`}
                            >
                                <CourseCard
                                    id={curso.id}
                                    curso={curso.nomeCurso}
                                    data={curso.data}
                                    horario={curso.hora}
                                    loja={curso.loja}
                                    culinarista={curso.culinarista}
                                    duracao={curso.duracao}
                                    categoria={curso.categoria}
                                    loadingVagasPorCurso={loadingVagasPorCurso}
                                    vagasLivres={vagas?.livres}
                                    vagasTotal={vagas ? vagas.livres + vagas.reservadas : 0}
                                    valor={curso.valor}
                                    onClick={() => openForm(curso.id)}
                                    className='h-full'
                                    imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                />
                            </Reveal>
                        );
                    })}
                </div>
            )}

            {link && <SectionAction link={link}>Ver agenda completa</SectionAction>}

        </section>
    )
}
