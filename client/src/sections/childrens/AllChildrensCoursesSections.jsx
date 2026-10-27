import { SlidersHorizontal } from 'lucide-react'
import CourseCard from '../../components/public/CourseCard'
import Reveal from '../../components/public/Reveal'
import Input from '../../components/Input'
import { filtroDataPadrao } from '../../utils/formatDate'

export default function AllChildrensCoursesSections({
    cursosFiltrados,
    vagasPorCurso,
    openForm,
    showModalFilters,
    setShowModalFilters,
    filters = {},
    setFilters,
    culinaristas = [],
    clearFilters,
}) {
    // o período padrão (hoje até 2 meses à frente) não conta como filtro —
    // senão o contador já abria marcando 2 e o "Limpar tudo" parecia não fazer nada
    const padrao = filtroDataPadrao()
    const periodoAlterado = filters.dataInicial !== padrao.dataInicial || filters.dataFinal !== padrao.dataFinal
    const activeCount = [periodoAlterado, filters.loja, filters.culinarista].filter(Boolean).length

    function toggleLoja(loja) {
        const next = filters.loja === loja ? '' : loja
        setFilters(prev => ({ ...prev, loja: next }))
    }

    return (
        <section className='max-w-7xl mx-auto px-5 md:px-8 pt-10 md:pt-14 pb-16'>

            <div className='flex items-end justify-between gap-4 mb-10 md:mb-12'>
                <div>
                    <p className='text-[11px] font-medium uppercase tracking-[0.32em] text-gold mb-2'>Para os pequenos</p>
                    <h1 className='font-serif text-[40px] md:text-[52px] font-medium text-chocolate leading-[1.05]'>Cursos <em className='italic text-orange-base'>infantis</em></h1>
                    <p className='text-sm font-light text-cocoa mt-2'>
                        {cursosFiltrados.length} {cursosFiltrados.length === 1 ? 'curso encontrado' : 'cursos encontrados'}
                    </p>
                </div>

                <button
                    onClick={() => setShowModalFilters(!showModalFilters)}
                    className='relative md:hidden shrink-0 flex items-center gap-2 bg-orange-base hover:bg-chocolate text-white px-4 py-2.5 rounded-full font-medium text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 cursor-pointer'
                >
                    <SlidersHorizontal size={15} />
                    Filtros
                    {activeCount > 0 && (
                        <span className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-orange-base text-[10px] font-semibold flex items-center justify-center shadow'>
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            <div className='md:flex md:items-start md:gap-7'>

                <aside className='hidden md:flex flex-col gap-4 w-60 xl:w-68 shrink-0 sticky top-24'>
                    <div className='bg-white rounded-xl ring-1 ring-chocolate/[0.07] p-6 flex flex-col gap-6'>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <SlidersHorizontal size={15} strokeWidth={1.5} className='text-gold' />
                                <p className='font-serif text-2xl text-chocolate leading-none'>Filtros</p>
                                {activeCount > 0 && (
                                    <span className='w-5 h-5 rounded-full bg-orange-base text-white text-[10px] font-semibold flex items-center justify-center'>
                                        {activeCount}
                                    </span>
                                )}
                            </div>
                            {activeCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className='text-[10px] uppercase tracking-[0.18em] text-orange-base hover:text-chocolate font-medium transition-colors duration-500 cursor-pointer'
                                >
                                    Limpar tudo
                                </button>
                            )}
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='text-[10px] font-medium text-cocoa/70 uppercase tracking-[0.25em]'>Loja</label>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => toggleLoja('Prado')}
                                    className={`flex-1 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.14em] border transition-colors duration-500 cursor-pointer ${
                                        filters.loja === 'Prado'
                                            ? 'bg-chocolate border-chocolate text-cream'
                                            : 'border-chocolate/15 text-cocoa hover:border-chocolate/40'
                                    }`}
                                >
                                    Prado
                                </button>
                                <button
                                    onClick={() => toggleLoja('Teresopolis')}
                                    className={`flex-1 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-[0.14em] border transition-colors duration-500 cursor-pointer ${
                                        filters.loja === 'Teresopolis'
                                            ? 'bg-chocolate border-chocolate text-cream'
                                            : 'border-chocolate/15 text-cocoa hover:border-chocolate/40'
                                    }`}
                                >
                                    Teresópolis
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='text-[10px] font-medium text-cocoa/70 uppercase tracking-[0.25em]'>Período</label>
                            <div className='flex flex-col gap-2'>
                                <div>
                                    <p className='text-[11px] font-light text-cocoa/70 mb-1'>De</p>
                                    <Input
                                        type='date'
                                        className='w-full cursor-pointer text-sm'
                                        value={filters.dataInicial || ''}
                                        onChange={e => setFilters(prev => ({ ...prev, dataInicial: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <p className='text-[11px] font-light text-cocoa/70 mb-1'>Até</p>
                                    <Input
                                        type='date'
                                        className='w-full cursor-pointer text-sm'
                                        value={filters.dataFinal || ''}
                                        onChange={e => setFilters(prev => ({ ...prev, dataFinal: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {culinaristas.length > 0 && (
                            <div className='flex flex-col gap-2'>
                                <label className='text-[10px] font-medium text-cocoa/70 uppercase tracking-[0.25em]'>Culinarista</label>
                                <select
                                    className='w-full h-10 px-3 border border-chocolate/15 rounded-lg text-chocolate text-sm bg-white cursor-pointer'
                                    value={filters.culinarista || ''}
                                    onChange={e => setFilters(prev => ({ ...prev, culinarista: e.target.value }))}
                                >
                                    <option value=''>Todas</option>
                                    {culinaristas.map(c => (
                                        <option key={c.id} value={c.nomeCulinarista}>{c.nomeCulinarista}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </aside>

                <div className='flex-1 min-w-0'>
                    {cursosFiltrados.length === 0 ? (
                        <div className='flex flex-col items-center justify-center text-center mt-24 gap-3'>
                            <p className='font-serif text-3xl text-chocolate'>Nenhum curso encontrado.</p>
                            <p className='text-cocoa font-light text-sm'>Tente ajustar os filtros.</p>
                            {activeCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className='text-sm text-orange-base hover:underline cursor-pointer mt-1'
                                >
                                    Limpar filtros
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'>
                            {cursosFiltrados.map((curso, i) => {
                                const vagas = vagasPorCurso[curso.id]
                                return (
                                    <Reveal key={curso.id} delay={(i % 3) * 100}>
                                    <CourseCard
                                        id={curso.id}
                                        curso={curso.nomeCurso}
                                        data={curso.data}
                                        horario={curso.hora}
                                        loja={curso.loja}
                                        culinarista={curso.culinarista}
                                        duracao={curso.duracao}
                                        categoria={curso.categoria}
                                        loadingVagasPorCurso={!vagas}
                                        vagasLivres={vagas?.livres}
                                        vagasTotal={vagas ? vagas.livres + vagas.reservadas : 0}
                                        valor={curso.valor}
                                        onClick={() => openForm(curso.id)}
                                        className='h-full'
                                        imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                    />
                                    </Reveal>
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}
