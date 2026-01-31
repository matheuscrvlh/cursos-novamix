// React 
import { useContext, useState, useEffect } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { getAssentos } from '../../api/courses.service';

// HOOKS
import { useThemeColor } from '../../hooks/useThemeColor';

// HEAD 
import { Head } from '../../components/Head'

// Components
import Text from '../../components/Text'
import CourseCard from '../../components/public/CourseCard'
import Modal from '../../components/public/Modal';
import Input from '../../components/Input'
import Button from '../../components/Button';

//Layouts
import PublicLayout from '../../layouts/public/PublicLayout'

// Images
import { bannerHome } from '../../assets/images/banner/'

export default function Home() {
    const {
        cursos,
        loading,
        addRegisterClient
    } = useContext(DadosContext);

    // ========= STATE CADASTRO CLIENTE  ========= 
    const [form, setForm] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        telefone: '',
        assento: ''
    })

    // ========= STATE VAGAS ========= 
    const [vagasPorCurso, setVagasPorCurso] = useState({});
    const [refreshVagas, setRefreshVagas] = useState(0);

    // ========= STATE ASSENTOS ========= 
    const [cursoSelecionado, setCursoSelecionado] = useState('');
    const [assentos, setAssentos] = useState([]);

    // ========= STATE MODAL ========= 
    const [step, setStep] = useState(null)

    // =========  CADASTRO CLIENTE ========= 
    function handleSubmit() {
        if (!form.nome || !form.cpf || !form.celular) {
            alert('Preencha todos os campos.')
            return;
        }

        addRegisterClient({
            cursoId: form.cursoId,
            nome: form.nome,
            cpf: form.cpf,
            celular: form.celular,
            assento: form.assento
        });

        setForm({
            cursoId: '',
            nome: '',
            cpf: '',
            celular: '',
            assento: ''
        });
    }

    useEffect(() => {
        if (!cursoSelecionado) {
            return
        }

        getAssentos(cursoSelecionado)
            .then(setAssentos)
            .catch(console.error)
    }, [cursoSelecionado])

    // =========  FUNCOES MODAL ========= 
    const openForm = (cursoId) => {
        setForm(prev => ({ ...prev, cursoId }))
        setStep('form')
        setCursoSelecionado(cursoId)
    }

    const openAssento = () => {
        if (!form.nome || !form.cpf || !form.celular) {
            alert('Preencha todos os campos.')
            return;
        }
        setStep('assento')
    }

    const openConfirmacao = () => {
        if (!form.assento) {
            alert('Marque algum assento.');
            return
        }
        setStep('confirmacao')
    }

    const closeModal = () => {
        setStep(null)
        setForm({ cursoId: '', nome: '', cpf: '', telefone: '', assento: '' })
        setCursoSelecionado('')
        setRefreshVagas(prev => prev + 1);
    }

    // ====== FUNCOES
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    // buscar vagas livres e reservadas
    useEffect(() => {
        if (!cursos.length) return;

        async function loadVagas() {
            const resultado = {};

            await Promise.all(
                cursos.map(async (curso) => {
                    const assentos = await getAssentos(curso.id);
                    resultado[curso.id] = {
                        livres: assentos.filter(v => v.status === 'livre').length,
                        reservadas: assentos.filter(v => v.status === 'reservado').length
                    };
                })
            );

            setVagasPorCurso(resultado);
        }

        loadVagas();
    }, [cursos, refreshVagas]);

    // FUNDO PAGINA
    useThemeColor('#FF8D0A');

    return (
        <PublicLayout>
            <Head title='Loja Novamix | Cursos' />
            <Text as='section' className='bg-orange-banner'>
                <Text
                    as='a'
                    href='#cursos'
                    className='block w-full'
                >
                    {/* Banner responsivo */}
                    <Text
                        as="section"
                        className="w-full overflow-hidden bg-orange-base"
                    >
                        <Text
                            as="div"
                            className="
                                    w-full
                                    min-h-[160px]
                                    bg-no-repeat
                                    bg-cover
                                    bg-right
                                    sm:min-h-[180px]
                                    md:min-h-[300px] md:bg-center
                                    lg:min-h-[360px]
                                    "
                            style={{
                                backgroundImage: `url(${bannerHome})`,
                                backgroundPosition: '43% center'
                            }}
                        />
                    </Text>
                </Text>

               <Text
                    as="div"
                    className="
                            bg-gray w-full text-center pt-6 pb-5
                            md:pt-12 md:pb-6
                        "
                    >
                    <Text
                        as="h1"
                        id="cursos"
                        className="
                                text-blue-base text-2xl font-bold tracking-wide relative inline-block
                                md:text-3xl
                                after:content-[''] after:block after:w-16 after:h-[3px] after:bg-orange-base after:mx-auto after:mt-3
                        ">
                        Nossos Cursos
                    </Text>
                    </Text>

                {/* Grid de cursos responsivo */}
                <Text as='div' className='bg-gray flex justify-center w-full pt-6 pb-20 md:pb-30 px-4'>
                    <Text as='div' className='max-w-[1400px] justify-items-center w-full bg-gray grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
                        {cursos.map(curso => {
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
                                    vagasLivres={vagas.livres}
                                    vagasReservadas={vagas.reservadas}
                                    valor={curso.valor}
                                    onClick={() => openForm(curso.id)}
                                    className='max-w-[350px] min-w-[20vw] w-[300px]'
                                    imagem={
                                        curso.fotos?.length
                                            ? curso.fotos[0]
                                            : null
                                    }
                                />
                            )
                        })}
                    </Text>
                </Text>

                {/* Modal de formulário - responsivo */}
                <Modal
                    width='90%'
                    maxWidth='500px'
                    height='auto'
                    isOpen={step === 'form'}
                    onClose={closeModal}
                >
                    <Text as='div' className='flex flex-col gap-3 h-full'>
                        <Text as='p' className='font-semibold mb-3 text-center text-lg md:text-xl mt-auto'>
                            Digite suas informações para cadastramos você!
                        </Text>
                        <Input
                            type='text'
                            width='100%'
                            height='40px'
                            placeholder='Nome completo'
                            value={form.nome}
                            onChange={e => setForm({ ...form, nome: e.target.value })}
                        />
                        <Input
                            type='text'
                            width='100%'
                            height='40px'
                            placeholder='CPF'
                            value={form.cpf}
                            onChange={e => setForm({ ...form, cpf: e.target.value })}
                        />
                        <Input
                            type='text'
                            width='100%'
                            height='40px'
                            placeholder='Telefone'
                            value={form.celular}
                            onChange={e => setForm({ ...form, celular: e.target.value })}
                        />
                        <Button
                            className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                            onClick={openAssento}
                        >
                            Enviar
                        </Button>
                    </Text>
                </Modal>

                {/* Modal de assentos - responsivo */}
                <Modal
                    width='90%'
                    maxWidth='600px'
                    height='auto'
                    isOpen={step === 'assento'}
                    onClose={closeModal}
                >
                    <Text as='div' className='flex flex-col gap-3 h-full'>
                        <Text as='p' className='font-semibold text-center text-lg md:text-xl mt-auto'>
                            Escolha seu assento para assistir ao curso
                        </Text>
                        <Text
                            as='div'
                            className='bg-gray-base rounded-sm p-4 md:p-6 text-center text-white font-semibold mb-6 md:mb-10'
                        >
                            Balcão
                        </Text>
                        {/* Grid de assentos responsivo */}
                        <Text as='div' className='grid grid-cols-6 gap-2'>
                            {assentos.map(assento => {
                                const isReservado = assento.status === 'reservado';
                                const isSelecionado = form.assento === assento.id;

                                return (
                                    <Text
                                        as='p'
                                        key={assento.id}
                                        className={`p-2 rounded-full text-center font-semibold text-white text-sm ${isReservado
                                            ? 'bg-gray-base cursor-not-allowed'
                                            : isSelecionado
                                                ? 'bg-gray-dark cursor-pointer'
                                                : 'bg-orange-base cursor-pointer'
                                            }`}
                                        onClick={() => {
                                            if (isReservado) return;

                                            setForm(prev => ({
                                                ...prev,
                                                assento: assento.id
                                            }));
                                        }}
                                    >
                                        {assento.id}
                                    </Text>
                                )
                            })}
                        </Text>
                        <Button
                            className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                            onClick={() => {
                                handleSubmit()
                                openConfirmacao()
                            }}
                        >
                            Enviar
                        </Button>
                    </Text>
                </Modal>

                {/* Modal de confirmação - responsivo */}
                <Modal
                    width='90%'
                    maxWidth='400px'
                    height='auto'
                    isOpen={step === 'confirmacao'}
                    onClose={closeModal}
                >
                    <Text
                        as='div'
                        className='flex flex-col w-full h-full font-semibold p-2 gap-3 text-center'
                    >
                        <Text as='p' className='text-lg md:text-xl'>Você foi cadastrado(a)!</Text>
                        <Text as='p' className='text-lg md:text-xl'>Entraremos em contato para finalizar seu pagamento.</Text>
                        <Button
                            className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                            onClick={() => closeModal()}
                        >
                            Sair
                        </Button>
                    </Text>
                </Modal>
            </Text>
        </PublicLayout>
    )
}

