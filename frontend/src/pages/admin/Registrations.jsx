// react
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

// Components
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import { DadosContext } from '../../contexts/DadosContext';
import { 
        getAssentos,
        getInscricoes, 
        putInscricoes, 
        deleteInscricoes, 
        getInscricoesTotais 
    } from '../../api/courses.service';

export default function Registrations() {
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
            await deleteInscricoes(inscricaoId)
            
            setInscricoes(prev => 
                prev.filter(inscricao => inscricao.id != inscricaoId)
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

            const assentos = await getAssentos(cursoId);
            const inscricoes = await getInscricoes(cursoId);
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

            putInscricoes(inscricaoAlterada.id, inscricaoAlterada);
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
        }
    }
    // ============== HANDLES ==============

    // ============== ONLOAD ==============
    useEffect(() => {
            getInscricoesTotais()
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
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Inscrições'/>
            <SideBar />
            <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Inscrições'} />
                <Text as='section' className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-xl mb-3 text-gray-text'>INSCRIÇÕES</Text>
                        <Text as='div' className='
                                grid-cols-[0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] font-bold text-gray-text
                                hidden md:grid
                            '
                        >
                            <Text as='p'>CURSO</Text>
                            <Text as='p'>DATA CURSO</Text>
                            <Text as='p'>NOME</Text>
                            <Text as='p'>ASSENTO</Text>
                            <Text as='p'>STATUS</Text>
                            <Text as='p'>PAGAMENTO</Text>
                            <Text as='p'>FUNÇÕES</Text>
                        </Text>
                        <Text as='hr' className='border-gray-base/30 w-full mt-4'/>
                        <Text as='div' className='max-h-[400px] overflow-y-auto'>
                            { 
                                inscricoesTotais.map(i => (
                                    <Text 
                                        as='div'
                                        key={i.id}
                                    >
                                        {/* MOBILE */}
                                        <Text 
                                            as='div' 
                                            className='
                                                p-3 text-gray-text
                                                md:hidden
                                            ' 
                                        >
                                            <Text as='p'>a fazer</Text>
                                            <Text as='p'>a fazer</Text>
                                            <Text as='p'>Nome: {i.nome}</Text>
                                            <Text as='p'>Assento: {i.assento}</Text>
                                            <Text as='p'>Status: {i.status}</Text>
                                            <Text as='p'>Pagamento: {i.formaPagamento}</Text>
                                            <Text as='div' className='flex gap-3 h-full mt-3'>
                                                <Button 
                                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-base/80 hover:shadow-md text-white'
                                                    // onClick={}
                                                >
                                                    <Edit />
                                                </Button>
                                                <Button 
                                                    className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-base/80 hover:shadow-md text-white'
                                                    // onClick={() => handleInscricoesCurso(i.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                            </Text>
                                        </Text>
                                        
                                        {/* DESKTOP */}
                                        <Text 
                                            as='div' 
                                            className='
                                                grid-cols-[0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] text-gray-text  p-2 items-center
                                                md:grid hidden
                                            ' 
                                        >
                                            <Text as='p'>a fazer</Text>
                                            <Text as='p'>a fazer</Text>
                                            <Text as='p'>{i.nome}</Text>
                                            <Text as='p'>{i.assento}</Text>
                                            <Text as='p'>{i.status}</Text>
                                            <Text as='p'>{i.formaPagamento}</Text>
                                            <Text as='div' className='flex gap-3 justify-center h-full'>
                                                <Button 
                                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-base/80 hover:shadow-md text-white'
                                                    // onClick={() => handleInscricoesCurso(i.id)}
                                                >
                                                    <Edit />
                                                </Button>
                                                <Button 
                                                    className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-base/80 hover:shadow-md text-white'
                                                    // onClick={() => handleInscricoesCurso(i.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                            </Text>
                                        </Text>
                                        <Text as='hr' className='border-gray-base/30 w-full'/>
                                    </Text>
                                ))
                            }
                        </Text>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-xl mb-3 text-gray-text'>CURSOS ATIVOS</Text>
                        <Text as='div' className='
                                grid-cols-[0.7fr_0.5fr_0.5fr_0.5fr_0.8fr_1fr] font-bold text-gray-text
                                hidden md:grid
                            '
                        >
                            <Text as='p'>DESCRIÇÃO</Text>
                            <Text as='p'>CULINARISTA</Text>
                            <Text as='p'>DATA</Text>
                            <Text as='p'>HORARIO</Text>
                            <Text as='p'>LOJA</Text>
                            <Text as='p'>FUNÇÕES</Text>
                        </Text>
                        <Text as='hr' className='border-gray-base/30 w-full mt-4'/>
                        <Text as='div' className='max-h-[400px] overflow-y-auto'>

                        </Text>
                        <Text as='div' className='max-h-[400px] overflow-y-auto'>
                            {loading ? (
                                <Text as='p'>Carregando cursos...</Text>
                            ) : (
                                cursos.map(curso => (
                                <Text 
                                    as='div'
                                    key={curso.id}
                                >
                                    {/* MOBILE */}
                                    <Text 
                                        as='div' 
                                        className='
                                            p-3 text-gray-text
                                            md:hidden
                                        ' 
                                    >
                                        <Text as='p'>Descrição: {curso.nomeCurso}</Text>
                                        <Text as='p'>Culinarista: {curso.culinarista}</Text>
                                        <Text as='p'>{layoutDataInput(curso.data)}</Text>
                                        <Text as='p'>{curso.hora}</Text>
                                        <Text as='p'>{curso.loja}</Text>
                                        <Text as='div' className='flex gap-3 h-full mt-3'>
                                            <Button 
                                                className='bg-gray-base p-2 rounded-md cursor-pointer hover:bg-gray-dark hover:shadow-md text-white'
                                                onClick={() => handleInscricoesCurso(curso.id)}
                                            >
                                                <Users />
                                            </Button>
                                        </Text>
                                    </Text>
                                    
                                    {/* DESKTOP */}
                                    <Text 
                                        as='div' 
                                        className='
                                            grid-cols-[0.7fr_0.5fr_0.5fr_0.5fr_0.8fr_1fr] text-gray-text  p-2 items-center
                                            md:grid hidden
                                        ' 
                                    >
                                        <Text as='p'>{curso.nomeCurso}</Text>
                                        <Text as='p'>{curso.culinarista}</Text>
                                        <Text as='p'>{layoutDataInput(curso.data)}</Text>
                                        <Text as='p'>{curso.hora}</Text>
                                        <Text as='p'>{curso.loja}</Text>
                                        <Text as='div' className='flex gap-3 justify-center h-full'>
                                            <Button 
                                                className='bg-gray-base p-2 rounded-md cursor-pointer hover:bg-gray-dark hover:shadow-md text-white'
                                                onClick={() => handleInscricoesCurso(curso.id)}
                                            >
                                                <Users />
                                            </Button>
                                        </Text>
                                    </Text>
                                    <Text as='hr' className='border-gray-base/30 w-full'/>
                                </Text>
                            )))}
                        </Text>
                    </CardDash>
                    <Modal
                        width='90%'
                        maxWidth='1200px'
                        height='auto'
                        isOpen={step === 'inscricoes'}
                        onClose={() => closeModal()}
                    >   
                        {/* MOBILE */}
                        <Text as='p' className='md:hidden text-xl font-bold mb-4 text-gray-text'>INSCRIÇÕES</Text>
                        <Text as='hr' className='md:hidden border-gray-base/30 w-full mt-3'/>
                        <Text 
                            as='div'
                            className='flex md:hidden flex-col gap-3 h-[90dvh] max-h-[70%] overflow-y-auto'
                        >
                            {inscricoes.length === 0 
                                ? <Text 
                                    className='mr-auto ml-auto p-10'
                                    key={1}
                                >
                                    Nenhuma inscrição encontrada
                                </Text> 
                                : inscricoes.map(inscricao => {
                                    return (
                                        <Text 
                                            as='div'
                                            key={inscricao.id}
                                        >
                                            <Text
                                                as='div'
                                                className=' text-gray-text items-center p-3'
                                            >
                                                <Text as='p'>Assento: {inscricao.assento}</Text>
                                                <Text as='p'>Nome: {inscricao.nome}</Text>
                                                <Text as='p'>CPF: {inscricao.cpf}</Text>
                                                <Text as='p'>Telefone: {inscricao.celular}</Text>
                                                <Text as='p'>Pagamento: {inscricao.formaPagamento}</Text>
                                                <Text as='p'>Data: {layoutDataSistem(inscricao.dataInscricao)}</Text>
                                                <Text 
                                                    as='div'
                                                >
                                                    <Text 
                                                        as='p' 
                                                        className={`p-2 w-20 mt-3 text-white font-semibold rounded-md text-center ${inscricao.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}
                                                    >
                                                        {inscricao.status}
                                                    </Text>
                                                </Text>
                                                <Text as='div' className='flex gap-3 mt-3'>
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
                                                </Text>
                                            </Text>
                                            <Text as='hr' className='border-gray-base/30 w-full'/>
                                        </Text>
                                    )
                            })}
                        </Text>

                        {/* DESKTOP */}
                        <Text 
                            as='div'
                            className='hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] font-bold text-gray-text'
                        >
                            <Text as='p'>ASSENTO</Text>
                            <Text as='p'>NOME</Text>
                            <Text as='p'>CPF</Text>
                            <Text as='p'>CELULAR</Text>
                            <Text as='p'>PAGAMENTO</Text>
                            <Text as='p'>STATUS</Text>
                            <Text as='p'>INSCRICAO</Text>
                            <Text as='p'>FUNÇÕES</Text>
                        </Text>
                        <Text as='hr' className='border-gray-base/30 w-full mt-3'/>
                        <Text 
                            as='div'
                            className='hidden md:flex flex-col gap-3 h-[400px] max-h-[70%] overflow-y-auto'
                        >
                            {inscricoes.length === 0 
                                ? <Text 
                                    className='mr-auto ml-auto p-10'
                                    key={1}
                                >
                                    Nenhuma inscrição encontrada
                                </Text> 
                                : inscricoes.map(inscricao => {
                                    return (
                                        <Text 
                                            as='div'
                                            key={inscricao.id}
                                        >
                                            <Text
                                                as='div'
                                                className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr_1fr] text-gray-text items-center p-2'
                                            >
                                                <Text as='p'>{inscricao.assento}</Text>
                                                <Text as='p'>{inscricao.nome}</Text>
                                                <Text as='p'>{inscricao.cpf}</Text>
                                                <Text as='p'>{inscricao.celular}</Text>
                                                <Text as='p'>{inscricao.formaPagamento}</Text>
                                                <Text 
                                                    as='div'
                                                >
                                                    <Text 
                                                        as='p' 
                                                        className={`p-2 w-20 text-white font-semibold rounded-md text-center ${inscricao.status === 'pago' ? 'bg-green-base' : 'bg-red-light'}`}
                                                    >
                                                        {inscricao.status}
                                                    </Text>
                                                </Text>
                                                <Text as='p'>{layoutDataSistem(inscricao.dataInscricao)}</Text>
                                                <Text as='div' className='flex gap-3'>
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
                                                </Text>
                                            </Text>
                                            <Text as='hr' className='border-gray-base/30 w-full'/>
                                        </Text>
                                    )
                            })}
                        </Text>
                    </Modal>
                </Text>
            </Text>
        </Text>
    )
}