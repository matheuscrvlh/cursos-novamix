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

    const closeModal = () => {
        if(!form.assento) {
            alert('Marque algum assento.');
            return
        }
        setStep(null)
        setForm({cursoId: '', nome: '', cpf: '', telefone: '', assento: ''})
        setCursoSelecionado('')
        alert('Você foi cadastrado!')
    }

    return (
        <PublicLayout>
            <Text as='section'>
                <Text 
                    as='a'
                    href='#cursos'
                >
                    <Text as='img' src={bannerHome} alt='banner' className='bg-blue-base w-full h-[220px] '/>
                </Text>
                <Text as='div' className='
                    bg-gray text-blue-base w-full text-center text-3xl 
                    font-bold pt-12 
                '>
                    <Text as='h1' id='cursos'>Nossos Cursos</Text>
                </Text>
                <Text as='div' className='
                    bg-gray flex justify-center gap-3 w-full justify-center pt-6 pb-30
                '>
                    <Text as='div' className='max-w-[80vw] bg-gray flex flex-wrap justify-center gap-3'>
                        {cursos.map(curso => (
                            <CourseCard key={curso.id} 
                                id={curso.id}
                                curso={curso.nomeCurso}
                                data={curso.data}
                                horario={curso.hora}
                                loja={curso.loja}
                                culinarista={curso.culinarista}
                                onClick={() => openForm(curso.id)}
                                imagem={
                                    curso.fotos?.length
                                    ? `http://localhost:3001${curso.fotos[0]}`
                                    : null
                                }
                            />
                        ))}  
                    </Text> 
                </Text>
                <Modal 
                    width='40%' 
                    height='60%'
                    isOpen={step === 'form'}
                    onClose={closeModal}
                >   
                    <Text as='div' className='flex flex-col gap-3 h-[90%]'>
                        <Text as='p' className='font-semibold mt-3 mb-3 text-center'>Digite suas informações para cadastramos você!</Text>
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
                            className='bg-orange-base hover:bg-orange-light text-white mt-auto'
                            onClick={openAssento}
                        >
                            Enviar
                        </Button>
                    </Text>
                </Modal>
                <Modal 
                    width='40%' 
                    height='60%'
                    isOpen={step === 'assento'}
                    onClose={closeModal}
                >   
                    <Text as='div' className='flex flex-col gap-3 h-[90%]'>
                        <Text as='p' className='font-semibold text-center'>Escolha seu assento para assistir ao curso</Text>
                        <Text 
                            as='div'
                            className='bg-gray-base rounded-sm p-6 mb-2 text-center text-white font-semibold'
                        >
                            Balcão
                        </Text>
                        <Text as='div' className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr] gap-2'>
                            {assentos.map(assento => {
                                const isReservado = assento.status === 'reservado';
                                const isSelecionado = form.assento === assento.id;

                                return (
                                    <Text 
                                        as='p'
                                        key={assento.id}
                                        className={`p-1 rounded-full text-center font-semibold text-white ${
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
                            )})}
                        </Text>
                        <Button 
                            className='bg-orange-base hover:bg-orange-light text-white mt-auto'
                            onClick={() => {
                                handleSubmit() 
                                closeModal()
                                }
                            }
                        >
                            Enviar
                        </Button>
                    </Text>
                </Modal>
            </Text>
        </PublicLayout>
    )
}