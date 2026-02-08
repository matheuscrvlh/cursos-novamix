// react
import { useContext, useState, useEffect } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X } from 'lucide-react';

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
import { getAssentos, getInscricoes, putInscricoes, deleteInscricoes, getCulinaristas } from '../../api/courses.service';

export default function Courses() {

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

    // ======= STATE ASSENTOS
    const [ assentos, setAssentos ] = useState([])

    // ======= STATE INSCRICOES
    const [ inscricoes, setInscricoes ] = useState([])

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')
    // ============== STATES ==============

    // DADOS CONTEXT
    const { 
            cursos,
            loading, 
            addCourses, 
            removeCourse,
            editCourse,
            culinaristas
        } = useContext(DadosContext);


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