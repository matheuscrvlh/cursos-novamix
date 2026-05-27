// react
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

// Components
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// SERVICES
import { getSeats, getEnrollment, getTotalEnrollment, putEnrollment, deleteEnrollment } from '../../api/enrollment.services';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function RegistrationsAdmin() {
    // ============== STATES ==============
    // ======= STATE ASSENTOS
    const [ assentos, setAssentos ] = useState([])

    // ======= STATE INSCRICOES
    const [ inscricoesTotais, setInscricoesTotais ] = useState([]);
    const [ loadingInscricoesTotais, setLoadingInscricoesTotais ] = useState(true)
    
    const [ inscricoes, setInscricoes ] = useState([])
    const [ loadingInscricoes, setLoadingInscricoes ] = useState([])

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')
    // ============== STATES ==============

    // DADOS CONTEXT
    const { 
            cursos,
            loading, 
        } = useContext(DadosContext);

    // ============== DELETE ==============
    async function deletarInscricao(inscricaoId) {
        try {
            await deleteEnrollment(inscricaoId)
            
            setInscricoes(prev => 
                prev.filter(inscricao => inscricao.id != inscricaoId)
            );

            setInscricoesTotais(prev => 
                prev.filter(inscricao => inscricao.id != inscricaoId )
            );

        } catch(err) {
            console.log('Erro ao deletar inscrição', err)
        }
    }
    // ============== DELETE ==============

    // ============== HANDLES ==============
    // ======== INSCRICOES CURSO
    async function handleInscricoesCurso(cursoId) {
        try{
            setStep('inscricoes');

            const assentos = await getSeats(cursoId);
            const inscricoes = await getEnrollment(cursoId);
            setAssentos(assentos);
            setInscricoes(inscricoes);
        
        } catch(err) {
            console.log(err)
        }
    }

    async function handleEditInscricao(inscricaoId) {
        try {
            const inscricaoFiltrada = inscricoes.find(inscricao =>
                inscricao.id === inscricaoId
            )

            const novoStatus = inscricaoFiltrada.status === 'verificar' ? 'pago' : 'verificar';

            const inscricaoAlterada = {
                id: inscricaoFiltrada.id,
                cursoId: inscricaoFiltrada.cursoId,
                nome: inscricaoFiltrada.nome,
                cpf: inscricaoFiltrada.cpf,
                celular: inscricaoFiltrada.celular,
                formaPagamento: inscricaoFiltrada.formaPagamento,
                assento: inscricaoFiltrada.assento,
                dataInscricao: inscricaoFiltrada.dataInscricao,
                status: novoStatus
            };

            setInscricoes(prev => 
                prev.map(inscricao => 
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );

            setInscricoesTotais(prev => 
                prev.map(inscricao => 
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );

            putEnrollment(inscricaoAlterada.id, inscricaoAlterada);
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
        }
    }

    async function handleEditInscricoesTotais(inscricaoId) {
        try {
            const inscricaoFiltrada = inscricoesTotais.find(inscricao =>
                inscricao.id === inscricaoId
            )

            const novoStatus = inscricaoFiltrada.status === 'verificar' ? 'pago' : 'verificar';

            const inscricaoAlterada = {
                id: inscricaoFiltrada.id,
                cursoId: inscricaoFiltrada.cursoId,
                nome: inscricaoFiltrada.nome,
                cpf: inscricaoFiltrada.cpf,
                celular: inscricaoFiltrada.celular,
                formaPagamento: inscricaoFiltrada.formaPagamento,
                assento: inscricaoFiltrada.assento,
                dataInscricao: inscricaoFiltrada.dataInscricao,
                status: novoStatus
            };

            setInscricoesTotais(prev => 
                prev.map(inscricao => 
                    inscricao.id === inscricaoAlterada.id
                    ? inscricaoAlterada
                    : inscricao
                )
            );

            putEnrollment(inscricaoAlterada.id, inscricaoAlterada);
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
        }
    }
    // ============== HANDLES ==============

    // ============== ONLOAD ==============
    useEffect(() => {
            getTotalEnrollment()
            .then(inscricoes => {
                setInscricoesTotais(inscricoes)
            })
            .catch(err => {
                console.log('Erro ao buscar todas inscricoes', err)
            })
            .finally(() => {
                setLoadingInscricoesTotais(false)
            })
        }, [])
    // ============== ONLOAD ==============

    // ============== FUNCOES ==============
    // layout para datas que vieram do input
    function layoutDataInput(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // layout para datas que vieram do sistema
    function layoutDataSistem(data) {
        if(data === undefined) {
            return
        }
        const dataFiltrada = data.split('T')[0];
        const [ano, mes, dia] = dataFiltrada.split('-')
        return `${dia}/${mes}/${ano}`;
    }

    function closeModal() {
        if(step === 'inscricoes') {
            setAssentos([]);
            setInscricoes([]);
            setStep('close');
            return

        } if(step === 'editCourse') {
            setCursoEditar({
                id: '',
                nomeCurso: '',
                data: '',
                hora: '',
                loja: '',
                culinarista: '',
                valor: '',
                duracao: '',
                categoria: '',
                ativo: 'true'
            });

            setStep('close');
            return

        } else {
            setStep('close');
            return
        }
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Inscrições'/>
            <SideBar />
            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Inscrições'} />
                <section className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <p className='font-bold text-xl mb-4 text-gray-text'>INSCRIÇÕES</p>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>CURSO</p>
                                <p>DATA CURSO</p>
                                <p>NOME</p>
                                <p>ASSENTO</p>
                                <p>STATUS</p>
                                <p>PAGAMENTO</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {inscricoesTotais.map(i => (
                                <div key={i.id}>
                                    {/* MOBILE */}
                                    <div className='p-3 text-gray-text md:hidden'>
                                        <p className='font-semibold'>{cursos.find(c => c.id === i.cursoId)?.nomeCurso}</p>
                                        <p className='text-sm text-gray-text/70'>Nome: {i.nome} · Assento: {i.assento}</p>
                                        <p className='text-sm text-gray-text/70'>Pagamento: {i.formaPagamento}</p>
                                        <span className={`text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full text-white ${i.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}>
                                            {i.status}
                                        </span>
                                        <div className='flex gap-2 mt-2'>
                                            <Button
                                                className='bg-orange-base p-2 hover:bg-orange-light text-white'
                                                onClick={() => handleEditInscricoesTotais(i.id)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                className='bg-red-base p-2 hover:bg-red-light text-white'
                                                onClick={() => deletarInscricao(i.id)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* DESKTOP */}
                                    <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                                    px-3 py-3 items-center text-gray-text text-sm
                                                    hover:bg-gray/60 transition-colors rounded-md'>
                                        <p className='truncate font-medium'>{cursos.find(c => c.id === i.cursoId)?.nomeCurso}</p>
                                        <p>
                                            {cursos.find(c => c.id === i.cursoId)?.data
                                                ? layoutDataInput(cursos.find(c => c.id === i.cursoId).data)
                                                : '-'
                                            }
                                        </p>
                                        <p className='truncate'>{i.nome}</p>
                                        <p>{i.assento}</p>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${i.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}>
                                            {i.status}
                                        </span>
                                        <p>{i.formaPagamento}</p>
                                        <div className='flex gap-2'>
                                            <Button
                                                className='bg-orange-base p-2 hover:bg-orange-light text-white'
                                                onClick={() => handleEditInscricoesTotais(i.id)}
                                            >
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                className='bg-red-base p-2 hover:bg-red-light text-white'
                                                onClick={() => deletarInscricao(i.id)}
                                            >
                                                <Trash size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                    <hr className='border-gray-base/20'/>
                                </div>
                            ))}
                        </div>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <p className='font-bold text-xl mb-4 text-gray-text'>INSCRIÇÕES POR CURSOS</p>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>DESCRIÇÃO</p>
                                <p>CULINARISTA</p>
                                <p>DATA</p>
                                <p>HORARIO</p>
                                <p>LOJA</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {loading ? (
                                <p className='text-gray-text text-center py-8'>Carregando cursos...</p>
                            ) : (
                                cursos.map(curso => (
                                    <div key={curso.id}>
                                        {/* MOBILE */}
                                        <div className='p-3 text-gray-text md:hidden'>
                                            <p className='font-semibold'>{curso.nomeCurso}</p>
                                            <p className='text-sm text-gray-text/70'>{curso.culinarista} · {layoutDataInput(curso.data)} · {curso.hora}</p>
                                            {curso.loja === 'Prado'
                                                ? <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                : <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                            }
                                            <div className='flex gap-2 mt-2'>
                                                <Button
                                                    className='bg-gray-base p-2 hover:bg-gray-dark text-white'
                                                    onClick={() => handleInscricoesCurso(curso.id)}
                                                >
                                                    <Users size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p className='font-medium truncate'>{curso.nomeCurso}</p>
                                            <p className='truncate'>{curso.culinarista}</p>
                                            <p>{layoutDataInput(curso.data)}</p>
                                            <p>{curso.hora}</p>
                                            {curso.loja === 'Prado'
                                                ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                            }
                                            <div className='flex gap-2'>
                                                <Button
                                                    className='bg-gray-base p-2 hover:bg-gray-dark text-white'
                                                    onClick={() => handleInscricoesCurso(curso.id)}
                                                >
                                                    <Users size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardDash>
                    <Modal
                        width='90%'
                        maxWidth='1200px'
                        height='auto'
                        isOpen={step === 'inscricoes'}
                        onClose={() => closeModal()}
                    >   
                        {/* MOBILE */}
                        <p className='md:hidden text-xl font-bold mb-4 text-gray-text'>INSCRIÇÕES</p>
                        <hr className='md:hidden border-gray-base/30 w-full mt-3'/>
                        <div className='flex md:hidden flex-col gap-3 h-[90dvh] max-h-[70%] overflow-y-auto'
                        >
                            {inscricoes.length === 0 
                                ? <span className='mr-auto ml-auto p-10'
                                    key={1}
                                >
                                    Nenhuma inscrição encontrada
                                </span> 
                                : inscricoes.map(inscricao => {
                                    return (
                                        <div key={inscricao.id}
                                        >
                                            <div className=' text-gray-text items-center p-3'
                                            >
                                                <p>Assento: {inscricao.assento}</p>
                                                <p>Nome: {inscricao.nome}</p>
                                                <p>CPF: {inscricao.cpf}</p>
                                                <p>Telefone: {inscricao.celular}</p>
                                                <p>Pagamento: {inscricao.formaPagamento}</p>
                                                <p>Data: {layoutDataSistem(inscricao.dataInscricao)}</p>
                                                <div >
                                                    <p className={`p-2 w-20 mt-3 text-white font-semibold rounded-md text-center ${inscricao.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}
                                                    >
                                                        {inscricao.status}
                                                    </p>
                                                </div>
                                                <div className='flex gap-3 mt-3'>
                                                    <Button
                                                        className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                                        onClick={() => handleEditInscricao(inscricao.id)}
                                                    >
                                                        <Edit />
                                                    </Button>
                                                    <Button
                                                        className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                                        onClick={() => deletarInscricao(inscricao.id)}
                                                    >
                                                        <Trash />
                                                    </Button>
                                                </div>
                                            </div>
                                            <hr className='border-gray-base/30 w-full'/>
                                        </div>
                                    )
                            })}
                        </div>

                        {/* DESKTOP */}
                        <div className='hidden md:block max-h-100 overflow-y-auto'>

                            {/* HEADER */}
                            <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>ASSENTO</p>
                                <p>NOME</p>
                                <p>CPF</p>
                                <p>CELULAR</p>
                                <p>PAGAMENTO</p>
                                <p>STATUS</p>
                                <p>INSCRICAO</p>
                                <p>FUNÇÕES</p>
                            </div>

                            {inscricoes.length === 0
                                ? <p className='text-gray-text text-center py-8'>Nenhuma inscrição encontrada</p>
                                : inscricoes.map(inscricao => (
                                    <div key={inscricao.id}>
                                        <div className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p>{inscricao.assento}</p>
                                            <p className='truncate'>{inscricao.nome}</p>
                                            <p>{inscricao.cpf}</p>
                                            <p>{inscricao.celular}</p>
                                            <p>{inscricao.formaPagamento}</p>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full w-fit text-white ${inscricao.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}>
                                                {inscricao.status}
                                            </span>
                                            <p>{layoutDataSistem(inscricao.dataInscricao)}</p>
                                            <div className='flex gap-2'>
                                                <Button
                                                    className='bg-orange-base p-2 hover:bg-orange-light text-white'
                                                    onClick={() => handleEditInscricao(inscricao.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                                <Button
                                                    className='bg-red-base p-2 hover:bg-red-light text-white'
                                                    onClick={() => deletarInscricao(inscricao.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            }
                        </div>
                    </Modal>
                </section>
            </main>
        </div>
    )
}