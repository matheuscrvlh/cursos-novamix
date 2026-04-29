// react
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Users } from 'lucide-react';

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

    const [assentos, setAssentos] = useState([]);

    const [inscricoesTotais, setInscricoesTotais] = useState([]);
    const [loadingInscricoesTotais, setLoadingInscricoesTotais] = useState(true);

    const [inscricoes, setInscricoes] = useState([]);

    const [step, setStep] = useState('close');

    const { cursos, loading } = useContext(DadosContext);

    // DELETE
    async function deletarInscricao(id) {
        try {
            await deleteEnrollment(id);

            setInscricoes(prev => prev.filter(i => i.id !== id));
            setInscricoesTotais(prev => prev.filter(i => i.id !== id));

        } catch (err) {
            console.log(err);
        }
    }

    // HANDLES
    async function handleInscricoesCurso(cursoId) {
        try {
            setStep('inscricoes');

            const assentos = await getSeats(cursoId);
            const inscricoes = await getEnrollment(cursoId);

            setAssentos(assentos);
            setInscricoes(inscricoes);

        } catch (err) {
            console.log(err);
        }
    }

    async function toggleStatus(inscricao, listaSetter) {
        const novoStatus = inscricao.status === 'verificar' ? 'pago' : 'verificar';

        const atualizado = { ...inscricao, status: novoStatus };

        listaSetter(prev =>
            prev.map(i => i.id === inscricao.id ? atualizado : i)
        );

        putEnrollment(inscricao.id, atualizado);
    }

    useEffect(() => {
        getTotalEnrollment()
            .then(setInscricoesTotais)
            .finally(() => setLoadingInscricoesTotais(false));
    }, []);

    function formatDate(data) {
        if (!data) return '-';
        const [ano, mes, dia] = data.split('T')[0].split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function closeModal() {
        setStep('close');
        setAssentos([]);
        setInscricoes([]);
    }

    return (
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>

            <Head title='Admin | Inscrições' />

            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>

                <TopBar title='Inscrições' />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] md:gap-20 lg:w-[78vw]'>

                    {/* INSCRIÇÕES GERAIS */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>

                        <p className='font-bold text-xl mb-3'>INSCRIÇÕES</p>

                        <div className='hidden md:grid grid-cols-7 font-bold'>
                            <p>CURSO</p>
                            <p>DATA</p>
                            <p>NOME</p>
                            <p>ASSENTO</p>
                            <p>STATUS</p>
                            <p>PAGAMENTO</p>
                            <p>AÇÕES</p>
                        </div>

                        <hr className='my-3' />

                        <div className='max-h-[400px] overflow-y-auto'>

                            {inscricoesTotais.map(i => {
                                const curso = cursos.find(c => c.id === i.cursoId);

                                return (
                                    <div key={i.id} className='border-b py-2'>

                                        <div className='hidden md:grid grid-cols-7 items-center'>
                                            <p>{curso?.nomeCurso}</p>
                                            <p>{curso?.data ? formatDate(curso.data) : '-'}</p>
                                            <p>{i.nome}</p>
                                            <p>{i.assento}</p>

                                            <p className={`px-2 py-1 text-white text-center rounded ${i.status === 'pago' ? 'bg-green-500' : 'bg-red-400'}`}>
                                                {i.status}
                                            </p>

                                            <p>{i.formaPagamento}</p>

                                            <div className='flex gap-2 justify-center'>
                                                <Button onClick={() => toggleStatus(i, setInscricoesTotais)}>
                                                    <Edit />
                                                </Button>

                                                <Button onClick={() => deletarInscricao(i.id)}>
                                                    <Trash />
                                                </Button>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })}
                        </div>

                    </CardDash>

                    {/* CURSOS */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>

                        <p className='font-bold text-xl mb-3'>CURSOS</p>

                        <div className='max-h-[400px] overflow-y-auto'>

                            {loading ? (
                                <p>Carregando...</p>
                            ) : (
                                cursos.map(curso => (
                                    <div key={curso.id} className='flex justify-between border-b py-2'>

                                        <div>
                                            <p>{curso.nomeCurso}</p>
                                            <p>{curso.culinarista}</p>
                                        </div>

                                        <Button onClick={() => handleInscricoesCurso(curso.id)}>
                                            <Users />
                                        </Button>

                                    </div>
                                ))
                            )}
                        </div>

                    </CardDash>

                    {/* MODAL */}
                    <Modal isOpen={step === 'inscricoes'} onClose={closeModal}>

                        <h2 className='text-xl font-bold mb-4'>Inscrições do curso</h2>

                        <div className='max-h-[400px] overflow-y-auto'>

                            {inscricoes.map(i => (
                                <div key={i.id} className='border-b py-2'>

                                    <p><strong>{i.nome}</strong></p>
                                    <p>Assento: {i.assento}</p>
                                    <p>Status: {i.status}</p>

                                    <div className='flex gap-2 mt-2'>
                                        <Button onClick={() => toggleStatus(i, setInscricoes)}>
                                            <Edit />
                                        </Button>

                                        <Button onClick={() => deletarInscricao(i.id)}>
                                            <Trash />
                                        </Button>
                                    </div>

                                </div>
                            ))}

                        </div>

                    </Modal>

                </section>

            </main>

        </div>
    )
}