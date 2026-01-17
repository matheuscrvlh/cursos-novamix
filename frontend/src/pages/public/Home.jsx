// React 
import { useContext, useState, useEffect } from 'react';

// DB
import { DadosContext } from '../../contexts/DadosContext';

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
import { assentos } from '../../assets/images/icons'

export default function Home() {
    const { dados, loading } = useContext(DadosContext)
    const [ step, setStep ] = useState(null)

    useEffect(() => {
        console.log(step)
    }, [step])

    const openForm = (cursoId) => {
        setForm(prev => ({ ...prev, cursoId }))
        setStep('form')
    }

    const openAssento = () => {
        setStep('assento')
    }

    const closeModal = () => {
        setStep(null)
        setForm({cursoId: '', nome: '', cpf: '', telefone: '', assento: ''})
    }

    const [ form, setForm ] = useState({
        cursoId: '',
        nome: '',
        cpf: '',
        telefone: '',
        assento: ''
    })

    useEffect(() => {
        console.log(form)
    }, [form])

    function handleSubmit() {
        if(!form.nome || !form.cpf || form.telefone) {
            alert('Preencha todos os campos.')
        }
    }

    useEffect(() => {
        console.log(open)
    }, [open])

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
                        {dados.map(curso => (
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
                            value={form.telefone}
                            onChange={e => setForm({...form, telefone: e.target.value})}
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
                        <Text as='p' className='font-semibold mt-3 mb-3 text-center'>Escolha seu assento para assistir ao curso</Text>
                        <Text
                            as='img'
                            src={assentos}
                            alt='Assentos'
                            className='w-[40%] h-full ml-auto mr-auto'
                            />
                        <Button 
                            className='bg-orange-base hover:bg-orange-light text-white mt-auto'
                            onClick={closeModal}
                        >
                            Enviar
                        </Button>
                    </Text>
                </Modal>
            </Text>
        </PublicLayout>
    )
}