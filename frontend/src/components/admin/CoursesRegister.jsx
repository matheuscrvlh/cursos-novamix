// React
import { useContext, useState, useEffect } from 'react';

// Components
import Input from '../../components/Input'
import Text from '../../components/Text'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../public/Modal';

// DB
import { DadosContext } from '../../contexts/DadosContext';
import { getAssentos } from '../../api/courses.service';

export default function CoursesRegister() {
    const { 
            cursos,
            loading, 
            addCourses, 
            removeCourse,
            editCourse,
            addCulinarian,
            removeCulinarian,
            culinaristas
        } = useContext(DadosContext);
    
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
    const [formCulinarian, setFormCulinarian] = useState({
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

    // ======= STATE ASSENTOS
    const [ assentos, setAssentos ] = useState([])

    // ======= STATE MODAL
    const [ step, setStep ] = useState('close')

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
            formData.append('fotos', form.imagem); // mesmo nome do backend
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

    // ======== EDIT CURSOS
    function handleEditCourse(cursoId) {
        setStep('edit');

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

    useEffect(() => {
            console.log(cursoEditar)
        }, [cursoEditar])

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
            ativo: 'true'
        });

        setStep('close');
    }

    // ======== INSCRICOES CURSO
    async function handleInscricoesCurso(cursoId) {
        try{setStep('inscricoes');

        const assentos = await getAssentos(cursoId);
        console.log(assentos)
        setAssentos(assentos)
        
        } catch(err) {
            console.log(err)
        }
    }

    // ======== HANDLES
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

    // ====== FUNCOES
    // layout data
    function layoutData(data) {
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    }

    function closeModal() {
        if(step === 'inscricoes') {
            setAssentos([]);
            setStep('close');
            return

        } else if(step === 'edit') {
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

    useEffect(() => {
        console.log(assentos)
    }, [assentos])

    return (
        <Text as='article' className='flex flex-col gap-10 mt-10'>
            <CardDash className='bg-white h-[200px] w-full h-full rounded-md p-10 shadow-sm'>
                <Text as='p' className='font-bold text-gray-text'>CADASTRE UM CURSO</Text>
                <Text as='div' className='flex flex-wrap w-full gap-[20px] mt-[30px]'>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Curso</Text>
                        <Input 
                            type='text'
                            placeholder='Curso'
                            width='400px'
                            height='40px'
                            value={form.nomeCurso}
                            onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                    />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Data</Text>
                        <Input 
                            type='date' 
                            width='170px'
                            height='40px'
                            value={form.data}
                            onChange={e => setForm({ ...form, data: e.target.value })}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Horario</Text>
                        <Input 
                            type='time' 
                            width='140px'
                            height='40px'
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
                        <Input 
                            type='text'
                            width='400px'
                            height='40px'
                            placeholder='Culinarista'
                            value={form.culinarista}
                            onChange={e => setForm({ ...form, culinarista: e.target.value })}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Valor</Text>
                        <Input 
                            type='text' 
                            width='170px'
                            height='40px'
                            placeholder='Valor'
                            value={form.valor}
                            onChange={e => setForm({ ...form, valor: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Duração</Text>  
                        <Input 
                            type='text'
                            width='140px'
                            height='40px'
                            placeholder='Duração'
                            value={form.duracao}
                            onChange={e => setForm({ ...form, duracao: e.target.value })}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Categoria</Text>    
                        <Input 
                            type='text'
                            width='150px'
                            height='40px'
                            placeholder='Categoria'
                            value={form.categoria}
                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Imagem</Text>  
                        <Input 
                            type='file'
                            accept='image/png, image/jpeg'
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
                <Text as='div' className='grid grid-cols-[0.7fr_0.5fr_0.5fr_0.5fr_0.8fr_1fr] font-bold text-gray-text'>
                    <Text as='p'>DESCRIÇÃO</Text>
                    <Text as='p'>CULINARISTA</Text>
                    <Text as='p'>DATA</Text>
                    <Text as='p'>HORARIO</Text>
                    <Text as='p'>LOJA</Text>
                    <Text as='p'>FUNÇÕES</Text>
                </Text>
                {loading ? (
                    <Text as='p'>Carregando cursos...</Text>
                ) : (
                    cursos.map(curso => (
                    <Text 
                        as='div' 
                        className='grid grid-cols-[0.7fr_0.5fr_0.5fr_0.5fr_0.8fr_1fr] text-gray-text mt-3' 
                        key={curso.id}
                    >
                        <Text as='p'>{curso.nomeCurso}</Text>
                        <Text as='p'>{curso.culinarista}</Text>
                        <Text as='p'>{layoutData(curso.data)}</Text>
                        <Text as='p'>{curso.hora}</Text>
                        <Text as='p'>{curso.loja}</Text>
                        <Text as='div' className='flex gap-3'>
                            <Button 
                                className='bg-red-base p-2 rounded-md cursor-pointer hover:bg-red-light hover:shadow-md text-white'
                                onClick={() => removeCourse(curso.id)}
                            >
                                Excluir
                            </Button>
                            <Button 
                                className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                onClick={() => handleEditCourse(curso.id)}
                            >
                                Editar
                            </Button>
                            <Button 
                                className='bg-gray-base p-2 rounded-md cursor-pointer hover:bg-gray-dark hover:shadow-md text-white'
                                onClick={() => handleInscricoesCurso(curso.id)}
                            >
                                Inscrições
                            </Button>
                        </Text>
                    </Text>
                )))}
            </CardDash>
            <CardDash as='div' className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                <Text as='p' className='font-bold text-gray-text mb-4'>CADASTRE UMA CULINARISTA</Text>
                <Text as='div' className='flex flex-wrap gap-3'>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Nome</Text> 
                        <Input
                            width='250px'
                            height='40px'
                            placeholder='Nome'
                            value={formCulinarian.nomeCulinarista}
                            onChange={e => setFormCulinarian({ ...formCulinarian, nomeCulinarista: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Cpf</Text> 
                        <Input
                            width='170px'
                            height='40px'   
                            placeholder='Cpf'
                            value={formCulinarian.cpf}
                            onChange={e => setFormCulinarian({ ...formCulinarian, cpf: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Industria</Text> 
                        <Input
                            width='170px'
                            height='40px'   
                            placeholder='Insdustria'
                            value={formCulinarian.industria}
                            onChange={e => setFormCulinarian({ ...formCulinarian, industria: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Telefone</Text> 
                        <Input
                            width='170px'
                            height='40px'   
                            placeholder='Telefone'
                            value={formCulinarian.telefone}
                            onChange={e => setFormCulinarian({ ...formCulinarian, telefone: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Instagram</Text> 
                        <Input
                            width='170px'
                            height='40px'   
                            placeholder='Instagram'
                            value={formCulinarian.instagram}
                            onChange={e => setFormCulinarian({ ...formCulinarian, instagram: e.target.value})}
                        />
                    </Text>
                    <Text as='div' className='flex flex-col text-gray-dark'>
                        <Text>Imagem</Text>
                        <Input
                            width='170px'
                            height='40px' 
                            className='mr-7'
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

                    <Text as='div' className='flex flex-col'>
                        <Text>Cursos que executa</Text>
                        <Text as='div' className='flex gap-3 text-gray-dark'>
                            <Input
                                width='250px'
                                height='40px'
                                placeholder='Curso'
                                value={formCulinarian.cursoAtual}
                                onChange={e => setFormCulinarian({ ...formCulinarian, cursoAtual: e.target.value })}
                            />
                            <Button
                                width='180px'
                                className='bg-orange-base text-white'
                                onClick={() => {
                                    if(!formCulinarian.cursoAtual) {
                                        alert('Preencha o campo.')
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
                                Adicionar Curso
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
                                    X
                                </Text>
                            </Text>
                        ))}
                    </Text>
                    <Button 
                        onClick={handleSubmitCulinarian}
                        className='bg-orange-base text-white w-full'
                    >
                        Adicionar Culinarista
                    </Button>
                </Text>
            </CardDash>
            <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                <Text as='div' className='font-bold text-gray-text'>
                    <Text>CULINARISTAS ATIVAS</Text>
                    <Text as='div' className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3'>
                        <Text as='p'>NOME</Text>
                        <Text as='p'>INDUSTRIA</Text>
                        <Text as='p'>TELEFONE</Text>
                        <Text as='p'>INSTAGRAM</Text>
                        <Text as='p'>LOJAS</Text>
                        <Text as='p'>CADASTRO</Text>
                        <Text as='p'>FUNÇOES</Text>
                    </Text>
                    <Text as='div'>
                        {culinaristas.map(c => (
                            <Text 
                                as='div' 
                                className='grid grid-cols-[1fr_1fr_0.5fr_0.5fr_0.8fr_0.5fr_0.5fr] text-gray-text mt-3'
                                key={c.id}
                            >
                                <Text as='p'>{c.nomeCulinarista}</Text>
                                <Text as='p'>{c.industria}</Text>
                                <Text as='p'>{c.telefone}</Text>
                                <Text as='p'>{c.instagram}</Text>
                                <Text as='p'>{c.lojas}</Text>
                                <Text as='p'>{c.dataCadastro}</Text>
                                <Button 
                                    className='bg-orange-base p-2 rounded-md cursor-pointer hover:bg-orange-light hover:shadow-md text-white'
                                    onClick={() => removeCulinarian(c.id)}
                                >
                                    Excluir
                                </Button>
                            </Text>
                        ))}
                    </Text>
                </Text>
            </CardDash>
            <Modal
                width='90%'
                maxWidth='400px'
                height='auto'
                isOpen={step === 'edit'}
                onClose={() => closeModal()}
            >   
                <Text as='div'>
                    <Text>Editar Curso</Text>
                </Text>
                <Text>
                    <Input
                        value={cursoEditar.nomeCurso}
                        onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                    />
                    <Input
                        type='date'
                        value={cursoEditar.data}
                        onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                    />
                    <Input
                        type='time'
                        value={cursoEditar.hora}
                        onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                    />
                    <Input
                        value={cursoEditar.loja}
                        onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                    />
                    <Input
                        value={cursoEditar.culinarista}
                        onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                    />
                    <Input
                        value={cursoEditar.valor}
                        onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                    />
                    <Input
                        value={cursoEditar.duracao}
                        onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                    />
                    <Input
                        value={cursoEditar.categoria}
                        onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                    />
                    <Input
                        type='file'
                        accept='imagem/png, image/jpeg'
                        value={cursoEditar.fotos}
                        onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                            }}
                    />
                </Text>
                <Button
                    onClick={() => editarCourse()}
                >
                    Salvar Edições
                </Button>
            </Modal>
            <Modal
                width='90%'
                maxWidth='400px'
                height='auto'
                isOpen={step === 'inscricoes'}
                onClose={() => closeModal()}
            >
                    {assentos.map(assento => {
                        return (
                            <Text
                                as='div'
                                className='flex'
                                key={assento.id}
                            >
                                <Text as='p'>{assento.id}</Text>
                                <Text as='p'>{assento.status}</Text>
                            </Text>
                        )
                    })}
            </Modal>
        </Text>
    )
}