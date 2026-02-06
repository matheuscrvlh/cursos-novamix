// React
import { useContext, useState, useEffect } from 'react';

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../public/Modal';

// DB
import { DadosContext } from '../../contexts/DadosContext';
import { getAssentos, getInscricoes, putInscricoes, deleteInscricoes, getCulinaristas } from '../../api/courses.service';

export default function CoursesRegister() {
    const { 
            cursos,
            loading, 
            addCourses, 
            removeCourse,
            editCourse,
            addCulinarian,
            removeCulinarian,
            editCulinarian,
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
        ativo: 'true'
    });

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

    // ======= STATE ASSENTOS
    const [ assentos, setAssentos ] = useState([])

    // ======= STATE INSCRICOES
    const [ inscricoes, setInscricoes ] = useState([])

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
    // ============== POST ==============

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
            ativo: cursoFiltrado.ativo
        });
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
            ativo: 'true',
        });

        setStep('close');
    }

    // ======== EDIT INSCRICOES
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
            console.log(inscricaoAlterada);
            putInscricoes(inscricaoAlterada.id, inscricaoAlterada);
        } catch(err) {
            console.log('Erro ao editar inscricao', err)
        }
    }

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

    useEffect(() => {
        console.log(culinarianEditar)
    }, [culinarianEditar])
    useEffect(() => {
        console.log(previewImagemCulinarista)
    }, [previewImagemCulinarista])
    // ============== PUT ==============

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
        if(step === 'inscricoes') {
            setAssentos([]);
            setInscricoes([]);
            setStep('close');
            return

        } else if(step === 'editCourse') {
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

        } else if(step === 'viewCulinarian') {
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
                    <Text as='div'>
                        <Text as='p'>Imagem</Text>
                        <Input
                            type='file'
                            accept='imagem/png, image/jpeg'
                            className='w-full h-[40px]'
                            value={cursoEditar.fotos}
                            onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;
                                }}
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
                    className='hidden md:grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] font-bold text-gray-text'
                >
                    <Text as='p'>ASSENTO</Text>
                    <Text as='p'>NOME</Text>
                    <Text as='p'>CPF</Text>
                    <Text as='p'>CELULAR</Text>
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
                                        className='grid grid-cols-[1fr_1fr_1fr_1fr_1fr_1fr_1fr] text-gray-text items-center p-2'
                                    >
                                        <Text as='p'>{inscricao.assento}</Text>
                                        <Text as='p'>{inscricao.nome}</Text>
                                        <Text as='p'>{inscricao.cpf}</Text>
                                        <Text as='p'>{inscricao.celular}</Text>
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
        </Text>
    )
}