// react
import { useContext, useState } from 'react';

// HEAD
import { Head } from '../../components/Head'

// LUCIDE ICONS
import { Trash, Edit, Inbox } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import Tooltip from '../../components/admin/Tooltip';

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

    // ======= STATE FILTRO STATUS
    const [ filtroStatus, setFiltroStatus ] = useState('todos')

    // ======= STATE FILTRO LOJA
    const [ filtroLoja, setFiltroLoja ] = useState('todas')
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

    // filtros
    const hoje = new Date().toISOString().split('T')[0];
    const cursosFiltrados = cursos.filter(c => {
        const passaStatus = filtroStatus === 'ativos' ? c.data >= hoje
                          : filtroStatus === 'concluidos' ? c.data < hoje
                          : true;
        const passaLoja = filtroLoja === 'todas' || c.loja === filtroLoja;
        return passaStatus && passaLoja;
    });

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
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Cursos'/>
            <SideBar />
             <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Cursos'} />
                <section className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    {/* ======== FORM CADASTRO ======== */}
                    <CardDash className='bg-white w-full rounded-md p-8 shadow-sm'>
                        <p className='font-bold text-gray-text mb-1'>CADASTRE UM CURSO</p>
                        <hr className='border-gray-base/30 w-full mb-6'/>

                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                            <div className='flex flex-col gap-1.5 lg:col-span-2'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Curso</label>
                                <Input
                                    type='text'
                                    placeholder='Nome do curso'
                                    value={form.nomeCurso}
                                    onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                                <Input
                                    type='text'
                                    placeholder='Categoria'
                                    value={form.categoria}
                                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                                <Input
                                    type='date'
                                    value={form.data}
                                    onChange={e => setForm({ ...form, data: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                                <Input
                                    type='time'
                                    value={form.hora}
                                    onChange={e => setForm({ ...form, hora: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                                <Input
                                    type='text'
                                    placeholder='Ex: 2h'
                                    value={form.duracao}
                                    onChange={e => setForm({ ...form, duracao: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                                <select
                                    value={form.loja}
                                    onChange={e => setForm({ ...form, loja: e.target.value })}
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                >
                                    <option value=''>Selecione a loja</option>
                                    <option value='Prado'>Prado</option>
                                    <option value='Teresopolis'>Teresopolis</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                                <select
                                    value={form.culinarista}
                                    onChange={e => setForm({ ...form, culinarista: e.target.value })}
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                >
                                    <option value=''>Selecione a culinarista</option>
                                    {culinaristas === null
                                    ? 'Nenhuma encontrada'
                                    : culinaristas.map(culinarista =>
                                        <option key={culinarista.id} value={culinarista.nomeCulinarista}>
                                            {culinarista.nomeCulinarista}
                                        </option>
                                    )}
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                                <Input
                                    type='text'
                                    placeholder='R$ 0,00'
                                    value={form.valor}
                                    onChange={e => setForm({ ...form, valor: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Imagem</label>
                                <Input
                                    type='file'
                                    accept='image/png, image/jpeg'
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (!file) return;
                                        setForm((prev) => ({ ...prev, imagem: file }));
                                    }}
                                />
                            </div>
                        </div>

                        <Button
                            className='bg-orange-base hover:bg-orange-light text-white w-full mt-6'
                            onClick={handleSubmit}
                        >
                            Adicionar Curso
                        </Button>
                    </CardDash>

                    {/* ======== LISTA DE CURSOS ======== */}
                    <CardDash className='bg-white w-full rounded-md p-8 shadow-sm'>
                        <div className='flex flex-col gap-3 mb-4'>
                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                                <p className='font-bold text-xl text-gray-text'>CURSOS</p>
                                <div className='flex flex-wrap gap-2'>
                                    {[
                                        { label: 'Todos', value: 'todos' },
                                        { label: 'Ativos', value: 'ativos' },
                                        { label: 'Concluídos', value: 'concluidos' },
                                    ].map(f => (
                                        <button
                                            key={f.value}
                                            onClick={() => setFiltroStatus(f.value)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                                filtroStatus === f.value
                                                    ? 'bg-orange-base text-white'
                                                    : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                            }`}
                                        >
                                            {f.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className='flex flex-wrap gap-2'>
                                {[
                                    { label: 'Todas as lojas', value: 'todas' },
                                    { label: 'Prado', value: 'Prado' },
                                    { label: 'Teresópolis', value: 'Teresopolis' },
                                ].map(f => (
                                    <button
                                        key={f.value}
                                        onClick={() => setFiltroLoja(f.value)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                                            filtroLoja === f.value
                                                ? f.value === 'Prado'
                                                    ? 'bg-orange-base text-white'
                                                    : f.value === 'Teresopolis'
                                                        ? 'bg-blue-base text-white'
                                                        : 'bg-gray-text text-white'
                                                : 'bg-gray text-gray-text hover:bg-gray-base/20'
                                        }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <hr className='border-gray-base/30 w-full mb-4'/>

                        <div className='max-h-112.5 overflow-y-auto'>

                        {/* HEADER DESKTOP */}
                        <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                        text-xs font-semibold text-gray-text uppercase tracking-wider
                                        bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                            <p>Descrição</p>
                            <p>Culinarista</p>
                            <p>Data</p>
                            <p>Horário</p>
                            <p>Loja</p>
                            <p>Ações</p>
                        </div>
                            {loading ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                                    <Inbox size={36} />
                                    <p className='text-sm'>Carregando cursos...</p>
                                </div>
                            ) : cursosFiltrados.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                                    <Inbox size={36} />
                                    <p className='text-sm'>Nenhum curso encontrado</p>
                                </div>
                            ) : (
                                cursosFiltrados.map((curso, i) => (
                                    <div key={i}>
                                        {/* MOBILE */}
                                        <div className='md:hidden p-3 text-gray-text'>
                                            <div className='flex items-center gap-2'>
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${curso.data >= hoje ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                                <p className='font-semibold'>{curso.nomeCurso}</p>
                                            </div>
                                            <p className='text-sm text-gray-text/70 mt-0.5'>{curso.culinarista} · {layoutDataInput(curso.data)} · {curso.hora}</p>
                                            {curso.loja === 'Prado'
                                                ? <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                : <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                            }
                                            <div className='flex gap-2 mt-2'>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => removeCourse(curso.id)}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Editar'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEditCourse(curso.id)}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p className='font-medium truncate pr-2'>{curso.nomeCurso}</p>
                                            <p className='truncate'>{curso.culinarista}</p>
                                            <div className='flex items-center gap-1.5'>
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${curso.data >= hoje ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                                <p>{layoutDataInput(curso.data)}</p>
                                            </div>
                                            <p>{curso.hora}</p>
                                            {curso.loja === 'Prado'
                                                ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                                : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                            }
                                            <div className='flex gap-2'>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => removeCourse(curso.id)}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Editar'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEditCourse(curso.id)}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardDash>
                    <Modal
                        width='90%'
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'editCourse'}
                        onClose={() => closeModal()}
                    >
                        {/* HEADER */}
                        <div className='mb-6'>
                            <h2 className='text-xl font-bold text-gray-text'>Editar Curso</h2>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        {/* FOTO */}
                        <div className='flex items-start gap-5 mb-6 p-4 bg-gray rounded-lg'>
                            {!previewImagemCurso && cursoEditar.fotos === null
                                ? <div className='w-28 h-28 shrink-0 rounded-lg bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>
                                    Sem foto
                                  </div>
                                : <img
                                    src={previewImagemCurso || cursoEditar.fotos}
                                    className='w-28 h-28 shrink-0 object-cover rounded-lg'
                                  />
                            }
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Alterar Foto</label>
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
                            </div>
                        </div>

                        {/* CAMPOS */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Descrição</label>
                                <Input
                                    value={cursoEditar.nomeCurso}
                                    onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                                <Input
                                    type='date'
                                    value={cursoEditar.data}
                                    onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                                <Input
                                    type='time'
                                    value={cursoEditar.hora}
                                    onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={cursoEditar.loja}
                                    onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                                >
                                    <option value='Prado'>Prado</option>
                                    <option value='Teresopolis'>Teresopolis</option>
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={cursoEditar.culinarista}
                                    onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                                >
                                    {culinaristas === null
                                    ? <option>Nenhuma encontrada</option>
                                    : culinaristas.map(culinarista =>
                                        <option key={culinarista.id} value={culinarista.nomeCulinarista}>
                                            {culinarista.nomeCulinarista}
                                        </option>
                                    )}
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                                <Input
                                    value={cursoEditar.valor}
                                    onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                                <Input
                                    value={cursoEditar.duracao}
                                    onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                                <Input
                                    value={cursoEditar.categoria}
                                    onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                                />
                            </div>
                        </div>

                        <Button
                            className='w-full bg-orange-base hover:bg-orange-light text-white'
                            onClick={() => editarCourse()}
                        >
                            Salvar Edições
                        </Button>
                    </Modal>
                </section>
            </main>
        </div>
    )
}