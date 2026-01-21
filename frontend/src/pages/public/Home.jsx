// React 
import { useContext, useState, useEffect } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

// SERVICES
import { getAssentos } from '../../api/courses.service';

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
    const [ form, setForm ] = useState({
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
    const [ cursoSelecionado, setCursoSelecionado ] = useState('');
    const [ assentos, setAssentos ] = useState([]);

    // ========= STATE MODAL ========= 
    const [ step, setStep ] = useState(null)

    // =========  CADASTRO CLIENTE ========= 
    function handleSubmit() {
        if(!form.nome || !form.cpf || !form.celular) {
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

        console.log(assentos)
    }, [cursoSelecionado])

    // =========  FUNCOES MODAL ========= 
    const openForm = (cursoId) => {
        setForm(prev => ({ ...prev, cursoId }))
        setStep('form')
        setCursoSelecionado(cursoId)
    }

    const openAssento = () => {
        if(!form.nome || !form.cpf || !form.celular) {
            alert('Preencha todos os campos.')
            return;
        }
        setStep('assento')
    }

    const openConfirmacao = () => {
        if(!form.assento) {
            alert('Marque algum assento.');
            return
        }
        setStep('confirmacao')
    }

    const closeModal = () => {
        setStep(null)
        setForm({cursoId: '', nome: '', cpf: '', telefone: '', assento: ''})
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

    return (
        <PublicLayout>
            <Text as='section' className='bg-orange-banner'>
                <Text 
                    as='a'
                    href='#cursos'
                    className='block w-full'
                >
                    {/* Banner responsivo */}
                    <Text 
                        as='img' 
                        src={bannerHome} 
                        alt='banner' 
                        className='bg-orange-base w-full h-auto max-h-[250px] sm:max-h-[300px] md:max-h-[350px] lg:max-h-[400px] object-contain'
                    />
                </Text>
                
                <Text as='div' className='bg-gray text-blue-base w-full text-center text-2xl md:text-3xl font-bold pt-8 md:pt-12'>
                    <Text as='h1' id='cursos'>Nossos Cursos</Text>
                </Text>
                
                {/* Grid de cursos responsivo */}
                <Text as='div' className='bg-gray flex justify-center w-full pt-6 pb-20 md:pb-30 px-4'>
                    <Text as='div' className='max-w-[1400px] w-full bg-gray grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'>
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
                                    imagem={
                                        curso.fotos?.length
                                        ? `http://localhost:3001${curso.fotos[0]}`
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
                            onChange={e => setForm({...form, nome: e.target.value})}
                        />
                        <Input 
                            type='text'
                            width='100%'
                            height='40px'
                            placeholder='CPF'
                            value={form.cpf}
                            onChange={e => setForm({...form, cpf: e.target.value})}
                        />
                        <Input 
                            type='text'
                            width='100%'
                            height='40px'
                            placeholder='Telefone'
                            value={form.celular}
                            onChange={e => setForm({...form, celular: e.target.value})}
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
                        <Text as='div' className='grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2'>
                            {assentos.map(assento => {
                                const isReservado = assento.status === 'reservado';
                                const isSelecionado = form.assento === assento.id;

                                return (
                                    <Text 
                                        as='p'
                                        key={assento.id}
                                        className={`p-2 rounded-full text-center font-semibold text-white text-sm ${
                                            isReservado
                                            ? 'bg-gray-base cursor-not-allowed'
                                            : isSelecionado
                                            ? 'bg-gray-dark cursor-pointer'
                                            : 'bg-orange-base cursor-pointer'
                                        }`}
                                        onClick={() => {
                                            if(isReservado) return;

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