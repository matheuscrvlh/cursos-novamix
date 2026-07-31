import { SlidersHorizontal } from 'lucide-react'
import CourseCard from '../../components/public/CourseCard'
import Input from '../../components/Input'
import { setLojaStorage } from '../../utils/lojaStorage'

function layoutData(data) {
    const [ano, mes, dia] = data.split('-')
    return `${dia}/${mes}/${ano}`
}

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
    const activeCount = [filters.dataInicial, filters.dataFinal, filters.loja, filters.culinarista].filter(Boolean).length

    function toggleLoja(loja) {
        const next = filters.loja === loja ? '' : loja
        setLojaStorage(next)
        setFilters(prev => ({ ...prev, loja: next }))
    }

    return (
        <section className='w-full px-10 sm:w-[92vw] sm:px-0 max-w-7xl mx-auto pt-10 md:pt-14 pb-16'>

            <div className='flex items-center justify-between mb-7'>
                <h2 className='text-xl font-bold text-gray-dark md:text-3xl tracking-tight'>
                    CURSOS INFANTIS
                </h2>

                <button
                    onClick={() => setShowModalFilters(!showModalFilters)}
                    className='relative md:hidden flex items-center gap-2 bg-orange-base hover:bg-orange-light text-white px-4 py-2 rounded-xl font-semibold text-sm transition cursor-pointer'
                >
                    <SlidersHorizontal size={15} />
                    Filtros
                    {activeCount > 0 && (
                        <span className='absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-orange-base text-[10px] font-bold flex items-center justify-center shadow'>
                            {activeCount}
                        </span>
                    )}
                </button>
            </div>

            <div className='md:flex md:items-start md:gap-7'>

                <aside className='hidden md:flex flex-col gap-4 w-60 xl:w-68 shrink-0 sticky top-24'>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-base/10 p-5 flex flex-col gap-5'>

                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                                <SlidersHorizontal size={15} className='text-orange-base' />
                                <p className='font-bold text-gray-dark text-sm'>Filtros</p>
                                {activeCount > 0 && (
                                    <span className='w-5 h-5 rounded-full bg-orange-base text-white text-[10px] font-bold flex items-center justify-center'>
                                        {activeCount}
                                    </span>
                                )}
                            </div>
                            {activeCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className='text-xs text-orange-base hover:text-orange-light font-medium transition cursor-pointer'
                                >
                                    Limpar tudo
                                </button>
                            )}
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='text-[11px] font-semibold text-gray-text/50 uppercase tracking-wider'>Loja</label>
                            <div className='flex gap-2'>
                                <button
                                    onClick={() => toggleLoja('Prado')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition cursor-pointer ${
                                        filters.loja === 'Prado'
                                            ? 'bg-orange-base border-orange-base text-white shadow-sm'
                                            : 'border-gray-base/25 text-gray-text/70 hover:border-orange-base/40'
                                    }`}
                                >
                                    Prado
                                </button>
                                <button
                                    onClick={() => toggleLoja('Teresopolis')}
                                    className={`flex-1 py-2 rounded-lg text-sm font-semibold border-2 transition cursor-pointer ${
                                        filters.loja === 'Teresopolis'
                                            ? 'bg-blue-base border-blue-base text-white shadow-sm'
                                            : 'border-gray-base/25 text-gray-text/70 hover:border-blue-base/40'
                                    }`}
                                >
                                    Teresópolis
                                </button>
                            </div>
                        </div>

                        <div className='flex flex-col gap-2'>
                            <label className='text-[11px] font-semibold text-gray-text/50 uppercase tracking-wider'>Período</label>
                            <div className='flex flex-col gap-2'>
                                <div>
                                    <p className='text-[10px] text-gray-text/40 mb-1'>De</p>
                                    <Input
                                        type='date'
                                        className='w-full cursor-pointer text-sm'
                                        value={filters.dataInicial || ''}
                                        onChange={e => setFilters(prev => ({ ...prev, dataInicial: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <p className='text-[10px] text-gray-text/40 mb-1'>Até</p>
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
                                <label className='text-[11px] font-semibold text-gray-text/50 uppercase tracking-wider'>Culinarista</label>
                                <select
                                    className='w-full h-10 px-3 border border-gray-base/40 rounded-lg text-gray-text text-sm bg-white cursor-pointer'
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
                            <p className='text-xl font-semibold text-gray-dark'>Nenhum curso encontrado.</p>
                            <p className='text-gray-text/50 text-sm'>Tente ajustar os filtros.</p>
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
                            {cursosFiltrados.map(curso => {
                                const vagas = vagasPorCurso[curso.id] || { livres: 0, reservadas: 0 }
                                return (
                                    <CourseCard
                                        key={curso.id}
                                        id={curso.id}
                                        curso={curso.nomeCurso}
                                        data={layoutData(curso.data)}
                                        horario={curso.hora}
                                        loja={curso.loja}
                                        culinarista={curso.culinarista}
                                        duracao={curso.duracao}
                                        categoria={curso.categoria}
                                        vagasLivres={vagas.livres}
                                        vagasReservadas={20}
                                        valor={curso.valor}
                                        onClick={() => openForm(curso.id)}
                                        className='w-full'
                                        imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                    />
                                )
                            })}
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}
