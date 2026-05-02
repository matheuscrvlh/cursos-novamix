// react
import { useContext, useState } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CoursesAdmin() {

    // DADOS CONTEXT
    const { 
            cursos,
            loading, 
            addCourses, 
            removeCourse,
            editCourse,
            culinaristas
        } = useContext(DadosContext);


    // ============== STATES ==============
    // ======= STATE CURSOS
    const [form, setForm] = useState({
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

    // ======= STATE EDICAO CURSO
    const [cursoEditar, setCursoEditar] = useState({
        id: '',
        nomeCurso: '',
        data: '',
        hora: '',
        loja: '',
        culinarista: '',
        valor: '',
        duracao: '',
        categoria: '',
        imagem: null,
        ativo: 'true'
    });

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')

    // ======= STATE PREVIEW IMAGEM
    const [ previewImagemCurso, setPreviewImagemCurso ] = useState(null)
    // ============== STATES ==============

    // ============== POST ==============
    // ======= CADASTRO CURSOS
    function handleSubmit() {
    if (!form.nomeCurso || !form.hora || !form.data || !form.loja || !form.categoria || !form.duracao) {
            alert('Preencha todos os campos');
        return;
        }

        const formData = new FormData();

        formData.append('nomeCurso', form.nomeCurso);
        formData.append('data', form.data);
        formData.append('hora', form.hora);
        formData.append('loja', form.loja);
        formData.append('culinarista', form.culinarista);
        formData.append('valor', form.valor);
        formData.append('duracao', form.duracao);
        formData.append('categoria', form.categoria);
        formData.append('ativo', form.ativo);

        if (form.imagem) {
            formData.append('fotos', form.imagem); 
        }

        addCourses(formData);

        setForm({
            nomeCurso: '',
            data: '',
            hora: '',
            loja: '',
            culinarista: '',
            valor: '',
            duracao: '',
            categoria: '',
            ativo: 'true',
            imagem: null,
        })
    }

    // ============== PUT ==============
    // ======== EDIT CURSOS
    function handleEditCourse(cursoId) {
        setStep('editCourse');

        const cursoFiltrado = cursos.find(c => c.id === cursoId);

        if(!cursoFiltrado) return;
        
        setCursoEditar({
            id: cursoFiltrado.id,
            nomeCurso: cursoFiltrado.nomeCurso,
            data: cursoFiltrado.data,
            hora: cursoFiltrado.hora,
            loja: cursoFiltrado.loja,
            culinarista: cursoFiltrado.culinarista,
            valor: cursoFiltrado.valor,
            duracao: cursoFiltrado.duracao,
            categoria: cursoFiltrado.categoria,
            fotos: cursoFiltrado.fotos[0],
            ativo: cursoFiltrado.ativo
        });

        if (cursoFiltrado.fotos?.[0]) {
            setPreviewImagemCurso(cursoFiltrado.fotos[0])
        }
    }

    function editarCourse() {
        const formData = new FormData()

        formData.append('id', cursoEditar.id);
        formData.append('nomeCurso', cursoEditar.nomeCurso);
        formData.append('data', cursoEditar.data);
        formData.append('hora', cursoEditar.hora);
        formData.append('loja', cursoEditar.loja);
        formData.append('culinarista', cursoEditar.culinarista);
        formData.append('valor', cursoEditar.valor);
        formData.append('duracao', cursoEditar.duracao);
        formData.append('categoria', cursoEditar.categoria);
        formData.append('ativo', cursoEditar.ativo);

        if (cursoEditar.fotos) {
            formData.append('fotos', cursoEditar.fotos)
        };

        editCourse(formData);

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
            fotos: '',
            ativo: 'true',
        });

        setStep('close');
    }

    // ============== FUNCOES ==============
    // layout para datas que vieram do input
    function layoutDataInput(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function closeModal() {
        if(step === 'editCourse') {
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

            setPreviewImagemCurso(null)

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
            <Head title='Admin | Cursos'/>
            <SideBar />
             <Text as='main' className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Cursos'} />
                <Text as='section' className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash className='
                            bg-white h-[200px] w-full h-full rounded-md p-10 shadow-sm
                        '
                    >
                        <Text as='p' className='font-bold text-gray-text'>CADASTRE UM CURSO</Text>
                        <Text as='div' className='flex flex-wrap w-full gap-[20px] mt-[30px]'>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Curso</Text>
                                <Input 
                                    type='text'
                                    placeholder='Curso'
                                    className='w-full h-[40px]'
                                    value={form.nomeCurso}
                                    onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                            />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Data</Text>
                                <Input 
                                    type='date' 
                                    className='w-full h-[40px]'
                                    value={form.data}
                                    onChange={e => setForm({ ...form, data: e.target.value })}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Horario</Text>
                                <Input 
                                    type='time' 
                                    className='w-full h-[40px]'
                                    value={form.hora}
                                    onChange={e => setForm({ ...form, hora: e.target.value })}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Loja</Text>
                                <Text 
                                    as='select' 
                                    value={form.loja}
                                    onChange={e => setForm({ ...form, loja: e.target.value})}
                                    className='w-[150px] h-[40px] border border-gray-base rounded-md'
                                >
                                    <Text as='option' value=''>Selecione a loja</Text>
                                    <Text as='option' value='Prado'>Prado</Text>
                                    <Text as='option' value='Teresopolis'>Teresopolis</Text>
                                </Text>
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Culinarista</Text>  
                                <Text
                                    as='select'
                                    value={form.culinarista}
                                    onChange={e => setForm({ ...form, culinarista: e.target.value })}
                                    className='w-[200px] h-[40px] border border-gray-base rounded-md'
                                >
                                    <Text as='option' value=''>Selecione a culinarista</Text>
                                    {culinaristas === null
                                    ? 'Nenhuma encontrada' 
                                    : culinaristas.map(culinarista =>
                                        <Text key={culinarista.id}
                                            as='option' 
                                            value={culinarista.nomeCulinarista}
                                        >
                                            {culinarista.nomeCulinarista}
                                        </Text>
                                    )}
                                </Text>
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Valor</Text>
                                <Input 
                                    type='text' 
                                    placeholder='Valor'
                                    className='w-full h-[40px]'
                                    value={form.valor}
                                    onChange={e => setForm({ ...form, valor: e.target.value})}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Duração</Text>  
                                <Input 
                                    type='text'
                                    placeholder='Duração'
                                    className='w-full h-[40px]'
                                    value={form.duracao}
                                    onChange={e => setForm({ ...form, duracao: e.target.value })}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Categoria</Text>    
                                <Input 
                                    type='text'
                                    placeholder='Categoria'
                                    className='w-full h-[40px]'
                                    value={form.categoria}
                                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                                />
                            </Text>
                            <Text as='div' className='flex flex-col text-gray-dark'>
                                <Text>Imagem</Text>  
                                <Input 
                                    type='file'
                                    accept='image/png, image/jpeg'
                                    className='w-full h-[40px]'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;

                                        setForm((prev) => ({
                                            ...prev,
                                            imagem: file,
                                        }));
                                    }}
                                >
                                </Input>
                            </Text>
                            <Button 
                                width='100%'
                                className='bg-orange-base hover:bg-orange-light text-white'
                                onClick={handleSubmit}
                            >
                                Adicionar
                            </Button>
                        </Text>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <Text as='p' className='font-bold text-xl mb-3 text-gray-text'>CURSOS</Text>
                        <Text as='div' className='
                                grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr] font-bold text-gray-text
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
                                                className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                                onClick={() => removeCourse(curso.id)}
                                            >
                                                <Trash />
                                            </Button>
                                            <Button 
                                                className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                                onClick={() => handleEditCourse(curso.id)}
                                            >
                                                <Edit />
                                            </Button>
                                        </Text>
                                    </Text>
                                    
                                    {/* DESKTOP */}
                                    <Text 
                                        as='div' 
                                        className='
                                            grid-cols-[1.5fr_0.8fr_0.5fr_0.5fr_0.5fr_0.5fr] text-gray-text  p-2 items-center
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
                                                className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                                onClick={() => removeCourse(curso.id)}
                                            >
                                                <Trash />
                                            </Button>
                                            <Button 
                                                className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                                onClick={() => handleEditCourse(curso.id)}
                                            >
                                                <Edit />
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
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'editCourse'}
                        onClose={() => closeModal()}
                    >   
                        <Text as='div' className='text-xl font-bold mb-4 text-gray-text'>
                            <Text>Editar Curso</Text>
                            <Text as='hr' className='border-gray-base/30 w-full mt-3'/>
                        </Text>
                        <Text as='div' className='flex gap-10'>
                            {cursoEditar.fotos === null 
                                ?   <Text as='p'
                                        className='w-[40%] min-h-[50%] p-8 bg-gray'
                                    >
                                        Nenhuma Foto Cadastrada
                                    </Text>
                                :   <Text
                                        as='img' 
                                        src={previewImagemCurso || cursoEditar.fotos}
                                        className='w-[30%]'
                                    />
                            }
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

                                        setCursoEditar((prev) => ({
                                            ...prev,
                                            fotos: file,
                                        }))

                                        const previewURL = URL.createObjectURL(file)
                                        setPreviewImagemCurso(previewURL)
                                    }}
                                />
                            </Text>
                        </Text>
                        <Text className='flex flex-wrap gap-3'>
                            <Text as='div'>
                                <Text as='p'>Descrição</Text>
                                <Input
                                    value={cursoEditar.nomeCurso}
                                    onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Data</Text>
                                <Input
                                    type='date'
                                    value={cursoEditar.data}
                                    onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Horario</Text>
                                <Input
                                    type='time'
                                    value={cursoEditar.hora}
                                    onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Loja</Text>
                                <Text
                                    as='select'
                                    className='w-[200px] h-[40px] border border-gray-base rounded-md'
                                    value={cursoEditar.loja}
                                    onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                                >
                                    <Text as='option' value='Prado'>Prado</Text>
                                    <Text as='option' value='Teresopolis'>Teresopolis</Text>
                                </Text>
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Culinarista</Text>
                                <Text
                                    as='select'
                                    className='w-[200px] h-[40px] border border-gray-base rounded-md'
                                    value={cursoEditar.culinarista}
                                    onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                                >
                                    {culinaristas === null
                                    ? 'Nenhuma encontrada' 
                                    : culinaristas.map(culinarista =>
                                        <Text 
                                            as='option' 
                                            key={culinarista.id}
                                            value={culinarista.nomeCulinarista}
                                        >
                                            {culinarista.nomeCulinarista}
                                        </Text>
                                    )}
                                </Text>
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Valor</Text>
                                <Input
                                    value={cursoEditar.valor}
                                    onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Duração</Text>
                                <Input
                                    value={cursoEditar.duracao}
                                    onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                                />
                            </Text>
                            <Text as='div'>
                                <Text as='p'>Categoria</Text>
                                <Input
                                    value={cursoEditar.categoria}
                                    onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                                />
                            </Text>
                        </Text>
                        <Button
                            className='w-full bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white mt-5'
                            onClick={() => editarCourse()}
                        >
                            Salvar Edições
                        </Button>
                    </Modal>
                </Text>
            </Text>
        </Text>
    )
}