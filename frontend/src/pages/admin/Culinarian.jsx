// Head
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState, useEffect } from 'react';

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// DB
import { DadosContext } from '../../contexts/DadosContext';
import { getCulinaristas } from '../../api/courses.service';

export default function Culinarian() {
    const { 
            addCulinarian,
            removeCulinarian,
            editCulinarian,
            culinaristas
        } = useContext(DadosContext);
    
    // ============== STATES ==============
    // ======= STATE CULINARISTAS
    const [cursoAtual, setCursoAtual] = useState('');

    const [formCulinarian, setFormCulinarian] = useState({
        nomeCulinarista: '',
        cpf: '',
        instagram: '',
        industria: '',
        telefone: '',
        lojas: [],
        cursos: [],
        foto: null
    });

    const [culinarianEditar, setCulinarianEditar] = useState({
        nomeCulinarista: '',
        cpf: '',
        instagram: '',
        industria: '',
        telefone: '',
        lojas: [],
        cursos: [],
        foto: null,
        dataCadastro: ''
    });

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')

    // ======= STATE PREVIEW
    const [ previewImagemCulinarista, setPreviewImagemCulinarista ] = useState();

    // ============== STATES ==============

    // ============== POST ==============
    // ======= CADASTRO CULINARISTA
    function handleSubmitCulinarian() {
        if(
            !formCulinarian.nomeCulinarista 
            || !formCulinarian.cpf 
            ) 
        {
            alert('Preencha os campos.');
            return
        }

        const formData = new FormData();

        formData.append('nomeCulinarista', formCulinarian.nomeCulinarista);
        formData.append('cpf', formCulinarian.cpf);
        formData.append('instagram', formCulinarian.instagram);
        formData.append('industria', formCulinarian.industria);
        formData.append('telefone', formCulinarian.telefone);
        formData.append('lojas', JSON.stringify(formCulinarian.lojas));
        formData.append('cursos', JSON.stringify(formCulinarian.cursos));

        if(formCulinarian.foto) {
            formData.append('foto', formCulinarian.foto);
        }

        addCulinarian(formData);

        setFormCulinarian({
            id: '',
            nomeCulinarista: '',
            cpf: '',
            instagram: '',
            industria: '',
            telefone: '',
            cursoAtual: '',
            lojas: [],
            cursos: [],
            foto: null
        });
    }
    // ============== POST ==============

    // ============== PUT ==============
    // ======== EDIT CULINARISTAS
    function handleEditCulinarian(culinaristaId) {
        setStep('editCulinarian');

        const culinaristaFiltrada = culinaristas.find(culinarista => culinarista.id === culinaristaId);

        setCulinarianEditar({
            id: culinaristaFiltrada.id,
            nomeCulinarista: culinaristaFiltrada.nomeCulinarista,
            cpf: culinaristaFiltrada.cpf,
            instagram: culinaristaFiltrada.instagram,
            industria: culinaristaFiltrada.industria,
            telefone: culinaristaFiltrada.telefone,
            lojas: culinaristaFiltrada.lojas,
            cursos: culinaristaFiltrada.cursos,
            foto: culinaristaFiltrada.foto,
            dataCadastro: culinaristaFiltrada.dataCadastro
        });

        if (typeof culinaristaFiltrada.foto === 'string') {
            setPreviewImagemCulinarista(culinaristaFiltrada.foto)
        }
    }

    async function editarCulinarian() {
        try {
            const formData = new FormData()

            formData.append('id', culinarianEditar.id);
            formData.append('nomeCulinarista', culinarianEditar.nomeCulinarista);
            formData.append('cpf', culinarianEditar.cpf);
            formData.append('instagram', culinarianEditar.instagram);
            formData.append('industria', culinarianEditar.industria);
            formData.append('telefone', culinarianEditar.telefone);
            formData.append('lojas', JSON.stringify(culinarianEditar.lojas));
            formData.append('cursos', JSON.stringify(culinarianEditar.cursos));
            formData.append('dataCadastro', culinarianEditar.dataCadastro);

            if (culinarianEditar.foto) {
                formData.append('foto', culinarianEditar.foto)
            };

            await editCulinarian(formData);

            const culinaristaAtualizada = await editCulinarian(formData);

            setCulinarianEditar ({
                id: '',
                nomeCulinarista: '',
                cpf: '',
                instagram: '',
                industria: '',
                telefone: '',
                cursoAtual: '',
                lojas: [],
                cursos: [],
                dataCadastro: ''
            });

            setStep('close')

        } catch (err) {
            console.log('Erro ao enviar edição', err)
        }
    }
    // ============== PUT ==============

    // ============== HANDLES ==============
    // view culinarista
    async function handleViewCulinarian(culinarianId) {
        try {
            setStep('viewCulinarian');

            const data = await getCulinaristas();
            const culinaristaFiltrada = data.find(c => c.id === culinarianId);

            setCulinarianEditar({
                id: culinaristaFiltrada.id,
                nomeCulinarista: culinaristaFiltrada.nomeCulinarista,
                cpf: culinaristaFiltrada.cpf,
                instagram: culinaristaFiltrada.instagram,
                industria: culinaristaFiltrada.industria,
                telefone: culinaristaFiltrada.telefone,
                lojas: culinaristaFiltrada.lojas,
                cursos: culinaristaFiltrada.cursos,
                foto: culinaristaFiltrada.foto,
                dataCadastro: culinaristaFiltrada.dataCadastro
            });

        } catch(err) {
            console.log('Erro ao visualizar culinarista', err)
        }
    }

    // ======== Toggle loja Culinarista
    function handleToggleLoja(loja) {
        setFormCulinarian(prev => {
            const existe = prev.lojas.includes(loja)

            return {
                ...prev,
                lojas:  existe
                ? prev.lojas.filter(l => l !== loja)
                : [...prev.lojas, loja]
            }
        })
    }
    // ============== HANDLES ==============

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
        if(step === 'viewCulinarian') {
        setCulinarianEditar({
                id: '',
                nomeCulinarista: '',
                cpf: '',
                instagram: '',
                industria: '',
                telefone: '',
                cursoAtual: '',
                lojas: [],
                cursos: [],
                foto: null
            });

        setStep('close');
        return
        
        } else if (step === 'editCulinarian') {
            setCulinarianEditar({
                id: '',
                nomeCulinarista: '',
                cpf: '',
                instagram: '',
                industria: '',
                telefone: '',
                cursoAtual: '',
                lojas: [],
                cursos: [],
                foto: null
            });

            setPreviewImagemCulinarista(null)

            setStep('close');
            return

        } else {
            setStep('close');
            return
        }
    }
    // ============== FUNCOES ==============
    return (
        <Text as='div' className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Culinaristas'/>
            <SideBar />
            <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Culinaristas'} />
                <Text as='section' className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash as='div' className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-gray-text mb-4'>CADASTRE UMA CULINARISTA</Text>
                        <Text as='div' className='flex flex-wrap gap-3'>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Nome</Text> 
                                <Input
                                    placeholder='Nome'
                                    className='w-full h-[40px]'
                                    value={formCulinarian.nomeCulinarista}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, nomeCulinarista: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Cpf</Text> 
                                <Input  
                                    placeholder='Cpf'
                                    className='w-full h-[40px]'
                                    value={formCulinarian.cpf}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, cpf: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Industria</Text> 
                                <Input   
                                    placeholder='Industria'
                                    className='w-full h-[40px]'
                                    value={formCulinarian.industria}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, industria: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Telefone</Text> 
                                <Input   
                                    placeholder='Telefone'
                                    className='w-full h-[40px]'
                                    value={formCulinarian.telefone}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, telefone: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Instagram</Text> 
                                <Input 
                                    placeholder='Instagram'
                                    className='w-full h-[40px]'
                                    value={formCulinarian.instagram}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, instagram: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Imagem</Text>
                                <Input
                                    className='w-full h-[40px] mr-7'
                                    type='file'
                                    accept='image/png, image/jpeg'
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if(!file) return
        
                                        setFormCulinarian((prev) => ({
                                            ...prev,
                                            foto: file,
                                        }))
                                    }}
                                />
                            </Text>    
                            <Text as='div' className='flex gap-3'>
                                <Input 
                                    type='checkbox'
                                    className='w-6 cursor-pointer'
                                    id='prado'
                                    name='Prado'
                                    value='Prado'
                                    onChange={() => handleToggleLoja('Prado')}
                                />
                                <Text as='label' className='mt-2 mr-9'>Prado</Text>
                                <Input 
                                    type='checkbox'
                                    className='w-6 cursor-pointer'
                                    id='teresopolis'
                                    name='teresopolis'
                                    value='Teresopolis'
                                    onChange={() => handleToggleLoja('Teresopolis')}
                                />
                                <Text as='label' className='mt-2'>Teresopolis</Text>
                            </Text>
                            <Text as='hr' className='border-gray-base/30 w-full mt-4 pb-2'/>
                            <Text as='div' className='flex flex-col'>
                                <Text>Cursos que executa</Text>
                                <Text as='div' className='flex gap-3 text-gray-dark'>
                                    <Input
                                        placeholder='Curso'
                                        className='w-full h-[40px]'
                                        value={formCulinarian.cursoAtual}
                                        onChange={e => setFormCulinarian({ ...formCulinarian, cursoAtual: e.target.value })}
                                    />
                                    <Button
                                        width='auto'
                                        className='bg-orange-base text-white hover:bg-orange-light'
                                        onClick={() => {
                                            if(!formCulinarian.cursoAtual) {
                                                alert('Preencha o campo.')
                                                return
                                            }
                                            setFormCulinarian({ 
                                                ...formCulinarian,
                                                cursos: [
                                                    ...formCulinarian.cursos,
                                                    formCulinarian.cursoAtual
                                                ],
                                                cursoAtual: ''
                                            })}
                                        }
                                    >
                                        <Plus />
                                    </Button>
                                </Text>
                            </Text>
                            <Text as='div' className='flex flex-wrap gap-3 w-full'>
                                {formCulinarian.cursos.map((curso, index) => (
                                    <Text 
                                        as='div'
                                        key={index}
                                        className="relative flex items-center"
                                    >
                                        <Text 
                                            as='p' 
                                            className="bg-orange-base px-4 py-2 text-white rounded-md"
                                        >
                                            {curso}
                                        </Text>
                                        <Text 
                                            className="
                                                absolute -top-2 -right-2
                                                flex items-center justify-center
                                                w-5 h-5 text-xs
                                                bg-black text-white
                                                rounded-full cursor-pointer font-bold
                                                "
                                            onClick={() => {
                                                setFormCulinarian({
                                                    ...formCulinarian,
                                                    cursos: formCulinarian.cursos.filter(
                                                        (_, i) => i !== index
                                                    )
                                                    
                                                })
                                            }}
                                        >
                                            <X />
                                        </Text>
                                    </Text>
                                ))}
                            </Text>
                            <Button 
                                onClick={handleSubmitCulinarian}
                                className='bg-orange-base text-white w-full hover:bg-orange-light'
                            >
                                Adicionar Culinarista
                            </Button>
                        </Text>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='div' className='text-gray-text'>
                            <Text as='p' className='font-bold'>CULINARISTAS ATIVAS</Text>
                            <Text as='div' className='
                                grid-cols-[1fr_1fr_0.8fr_0.7fr_0.8fr] text-gray-text mt-3 font-bold
                                hidden md:grid
                                '
                            >
                                <Text as='p'>NOME</Text>
                                <Text as='p'>INDUSTRIA</Text>
                                <Text as='p'>LOJAS</Text>
                                <Text as='p'>CADASTRO</Text>
                                <Text as='p'>FUNÇOES</Text>
                            </Text>
                            <Text as='hr' className='border-gray-base/30 w-full mt-4 pb-2'/>
                            <Text as='div' className='max-h-[400px] overflow-y-auto'>
                                {culinaristas.map(c => (
                                    <Text 
                                        as='div'
                                        key={c.id}
                                    >
                                        {/* MOBILE */}
                                        <Text 
                                            as='div' 
                                            className='
                                                p-3 text-gray-text
                                                md:hidden
                                            '
                                        >
                                            <Text as='p'>Culinarista: {c.nomeCulinarista}</Text>
                                            <Text as='p'>Industria: {c.industria}</Text>
                                            <Text as='p'>Loja: {c.lojas.length > 1 ? 'Prado e Teresopolis' : c.lojas}</Text>
                                            <Text as='p'>Cadastro: {layoutDataSistem(c.dataCadastro)}</Text>
                                            <Text as='div' className='flex gap-3 mt-3'>
                                                <Button 
                                                    className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                                    onClick={() => removeCulinarian(c.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                                <Button 
                                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                                    onClick={() => handleEditCulinarian(c.id)}
                                                >
                                                    <Edit />
                                                </Button>
                                                <Button 
                                                    className='bg-gray-base p-2 rounded-md cursor-pointer hover:bg-gray-dark hover:shadow-md text-white'
                                                    onClick={() => handleViewCulinarian(c.id)}
                                                >
                                                    <Users />
                                                </Button>
                                            </Text>
                                        </Text>
        
                                        {/* DESKTOP */}
                                        <Text 
                                            as='div' 
                                            className='grid-cols-[1fr_1fr_0.8fr_0.7fr_0.8fr] text-gray-text p-2 items-center
                                                hidden md:grid
                                            '
                                        >
                                            <Text as='p'>{c.nomeCulinarista}</Text>
                                            <Text as='p'>{c.industria}</Text>
                                            <Text as='p'>{c.lojas.length > 1 ? 'Prado e Teresopolis' : c.lojas}</Text>
                                            <Text as='p'>{layoutDataSistem(c.dataCadastro)}</Text>
                                            <Text as='div' className='flex gap-3'>
                                                <Button 
                                                    className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                                    onClick={() => removeCulinarian(c.id)}
                                                >
                                                    <Trash />
                                                </Button>
                                                <Button 
                                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                                    onClick={() => handleEditCulinarian(c.id)}
                                                >
                                                    <Edit />
                                                </Button>
                                                <Button 
                                                    className='bg-gray-base p-2 rounded-md cursor-pointer hover:bg-gray-dark hover:shadow-md text-white'
                                                    onClick={() => handleViewCulinarian(c.id)}
                                                >
                                                    <Users />
                                                </Button>
                                            </Text>
                                        </Text>
                                        <Text as='hr' className='border-gray-base/30 w-full'/>
                                    </Text>
                                ))}
                            </Text>
                        </Text>
                    </CardDash>

                    {/* ====== MODALS ===== */}
                    <Modal
                        width='90%'
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'editCulinarian'}
                        onClose={() => closeModal()}
                    >
                        <Text as='p' className='font-semibold text-xl mb-5 text-gray-text'>Editar Culinarista</Text>
                        <Text
                            as='div'
                            className='flex flex-wrap gap-4 text-gray-text'
                        >
                            <Text as='div' className='flex gap-10'>
                                <Text 
                                    as='img' 
                                    src={previewImagemCulinarista} 
                                    className=' w-[30%] rounded-xl'
                                />
                                <Text as='div'>
                                    <Text as='p'>Alterar Foto</Text>
                                    <Input
                                        type='file'
                                        accept='image/png, image/jpeg'
                                        onChange={(e) => {
                                            const file = e.target.files[0]
                                            if (!file) return

                                            if(!file.type.startsWith('image/')) {
                                                alert('Selecione uma imagem válida');
                                                return
                                            }

                                            setCulinarianEditar((prev) => ({
                                                ...prev,
                                                foto: file,
                                            }))

                                            const previewURL = URL.createObjectURL(file)
                                            setPreviewImagemCulinarista(previewURL)
                                        }}
                                    />
                                </Text>
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Nome</Text>
                                <Input
                                    type='text'
                                    value={culinarianEditar.nomeCulinarista}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, nomeCulinarista: e.target.value})}
                                />
                            </Text>
                            <Text 
                                as='div'>
                                <Text as='p'>Cpf</Text>
                                <Input
                                    type='text'
                                    value={culinarianEditar.cpf}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, cpf: e.target.value})}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Industria</Text>
                                <Input
                                    type='text'
                                    value={culinarianEditar.industria}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, industria: e.target.value})}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Telefone</Text>
                                <Input
                                    type='text'
                                    value={culinarianEditar.telefone}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, telefone: e.target.value})}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Instagram</Text>
                                <Input
                                    type='text'
                                    value={culinarianEditar.instagram}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, instagram: e.target.value})}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Lojas</Text>
                                <Text 
                                    as='select'
                                    className='w-[200px] h-[40px] border border-gray-base rounded-md'
                                    value={''}
                                    onChange={e => setCulinarianEditar({
                                        ...culinarianEditar,
                                        lojas: e.target.value.includes(',')
                                        ? e.target.value.split(',')
                                        : [e.target.value]
                                    })}
                                >
                                    <Text as='option' value=''>Selecione a loja</Text>
                                    <Text as='option' value='Prado'>Prado</Text>
                                    <Text as='option' value='Teresopolis'>Teresopolis</Text>
                                    <Text as='option' value='Prado,Teresopolis'>Prado e Teresopolis</Text>
                                </Text>
                            </Text>
                            <Text as='hr' className='border-gray-base/30 w-full'/>
                            <Text as='div' className='flex flex-col'>
                                <Text as='p'>Cursos que executa</Text>
                                <Text 
                                    as='div'
                                    className='flex gap-3 text-gray-dark'
                                >
                                    <Input
                                        width='250px'
                                        height='40px'
                                        value={cursoAtual}
                                        onChange={e => setCursoAtual(e.target.value)}
                                    />
                                    <Button
                                        className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                        onClick={() => {
                                            setCulinarianEditar(prev => ({
                                                ...prev,
                                                cursos: [
                                                    ...prev.cursos,
                                                    cursoAtual
                                                ]
                                            }))
                                            setCursoAtual('')
                                        }}
                                    >
                                        <Plus />
                                    </Button>
                                </Text>
                            </Text>
                            <Text as='div' className='w-full'>
                                <Text as='div' className='flex gap-3'>
                                    {culinarianEditar.cursos.map((curso, index) => (
                                            <Text 
                                                as='div'
                                                key={index}
                                                className="relative flex items-center"
                                            >
                                                <Text 
                                                    as='p'
                                                    className="bg-orange-base px-4 py-2 text-white rounded-md"
                                                >
                                                    {curso} 
                                                </Text>
                                                <Button
                                                    className="
                                                        absolute -top-2 -right-2
                                                        flex items-center justify-center
                                                        w-5 h-5 text-xs
                                                        bg-black text-white
                                                        rounded-full cursor-pointer font-bold
                                                    "
                                                    onClick={() => setCulinarianEditar({
                                                        ...culinarianEditar,
                                                        cursos: culinarianEditar.cursos.filter((_, i) => 
                                                            i !== index 
                                                        )
                                                    })}
                                                >
                                                    <Text>X</Text>
                                                </Button>
                                            </Text>
                                        ))
                                    }   
                                </Text>
                            </Text>
                            <Button
                                className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white w-full'
                                onClick={() => editarCulinarian()}
                            >
                                Salvar Edições
                            </Button>
                        </Text>
                    </Modal>
                    <Modal
                        width='90%'
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'viewCulinarian'}
                        onClose={() => closeModal()}
                    >
                        <Text as='p' className='font-semibold text-xl mb-5 text-gray-text'>Perfil da Culinarista</Text>
                        <Text
                            as='div'
                            className='flex flex-wrap gap-4 text-gray-text'
                        >
                            <Text
                                as='img' 
                                src={culinarianEditar.foto}
                                className='w-[30%]'
                            />
                            <Text>Nome: {culinarianEditar.nomeCulinarista}</Text>
                            <Text>Cpf: {culinarianEditar.cpf}</Text>
                            <Text>Industria: {culinarianEditar.industria}</Text>
                            <Text>Telefone: {culinarianEditar.telefone}</Text>
                            <Text>Instagram: {culinarianEditar.instagram}</Text>
                            <Text>Lojas: {culinarianEditar.lojas}</Text>
                            <Text>Cursos: {culinarianEditar.cursos}</Text>
                            <Text>Data Cadastro: {culinarianEditar.dataCadastro}</Text>
                        </Text>
                    </Modal>
                    {/* ====== MODALS ===== */}
                </Text>
            </Text>
        </Text>
    )
}