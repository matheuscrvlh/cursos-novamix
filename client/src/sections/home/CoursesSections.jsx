import { Link } from 'react-router-dom'

import Button from "../../components/Button";
import CourseCard from "../../components/public/CourseCard";

export default function CoursesSections({
    cursosFiltrados,
    loadingCourses,
    loadingVagasPorCurso,
    vagasPorCurso,
    openForm,
}) {

    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    return (
    <section className='pt-15 md:w-[80vw] md:mx-auto'>

            <div className='flex justify-between items-baseline pb-5 w-[80%] mx-auto md:w-[80vw]'>
                <p className='text-lg font-bold text-gray-dark md:text-3xl md:px-2'>
                    NOSSOS CURSOS
                </p>
            </div>

            <div className='
                    bg-gray flex justify-center w-full pb-7 md:pb-10
            '>
                {loadingCourses 
                    ? (
                        <div className='
                                flex flex-col items-center justify-center w-full text-center mt-25 mb-25
                        '>
                            <p className='text-xl font-semibold'>Carregando...</p>
                        </div>
                        )
                    : cursosFiltrados.length === 0
                    ?  (<div className='
                                flex flex-col items-center justify-center w-full text-center mt-25 mb-25
                        '>
                            <p className='text-xl font-semibold'>Nenhum curso encontrado.</p>
                            <p>Favor tente com outros filtros.</p>
                        </div>
                    ) : (
                        <div className='
                                bg-gray flex overflow-x-auto gap-10 justify-items-center
                                px-10 pb-3
                                sm:grid-cols-2 sm:overflow-x-hidden sm:px-2 sm:pb-4
                                lg:grid-cols-3
                                xl:grid-cols-4
                        '
                        >
                            {cursosFiltrados.slice(0, 4).map(curso => {
                                const vagas = vagasPorCurso[curso.id] || { livres: 0, reservadas: 0 };

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
                                        loadingVagasPorCurso={loadingVagasPorCurso}
                                        vagasLivres={vagas.livres}
                                        vagasReservadas={24}
                                        valor={curso.valor}
                                        onClick={() => openForm(curso.id)}
                                        className='
                                                w-full min-w-73 max-w-[380px]
                                        '
                                        imagem={curso.fotos?.length ? curso.fotos[0] : null}
                                    />
                                );
                            })}
                    </div>
                )}
            </div>

            <div className='
                flex w-full justify-center
            '>
                <Link to={'/cursos'}>
                    <Button className='bg-orange-base text-white hover:bg-orange-light text-sm px-5 py-1.5 sm:px-6 sm:py-2 cursor-pointer transition'>
                        Ver todos
                    </Button>
                </Link>
            </div>
            
        </section>
    )
}