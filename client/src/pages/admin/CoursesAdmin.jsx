import { useContext, useState } from 'react';
import { Trash, Edit, Inbox, Printer, Loader2 } from 'lucide-react';

import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import Tooltip from '../../components/admin/Tooltip';
import ConfirmModal from '../../components/admin/ModalConfirm';
import FilterPills from '../../components/admin/FilterPills';
import AdminPage from '../../layouts/admin/AdminPage';

import { DadosContext } from '../../contexts/DadosContext';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import useConfirmAction from '../../hooks/useConfirmAction';
import { formatDateBR, cursoEncerrado } from '../../utils/formatDate';
import { getEnrollment } from '../../api/enrollment.services';

function maskValor(value) {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const padded = digits.padStart(3, '0');
    const intPart = padded.slice(0, -2).replace(/^0+(\d)/, '$1');
    const decPart = padded.slice(-2);
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${intFormatted || '0'},${decPart}`;
}

function valorParaSalvar(valor) {
    return valor.replace(/\./g, '').replace(',', '.');
}

function formatValorDisplay(val) {
    if (val === '' || val == null) return '';
    const n = parseFloat(String(val).replace(',', '.'));
    if (isNaN(n)) return '';
    const cents = Math.round(n * 100).toString();
    return maskValor(cents);
}

function maskDuracao(value) {
    return value.replace(/[^0-9hHmMiInN]/g, '');
}

const FORM_VAZIO = {
    nomeCurso: '',
    data: '',
    hora: '',
    loja: '',
    culinaristaId: '',
    valor: '',
    duracao: '',
    categoria: '',
    ingredientes: '',
    ativo: 'true',
    imagem: null,
};

const EDITAR_VAZIO = {
    id: '',
    nomeCurso: '',
    data: '',
    hora: '',
    loja: '',
    culinaristaId: '',
    valor: '',
    duracao: '',
    categoria: '',
    ingredientes: '',
    fotos: '',
    ativo: 'true',
};

const FILTROS_STATUS = [
    { label: 'Todos', value: 'todos' },
    { label: 'Ativos', value: 'ativos' },
    { label: 'Concluídos', value: 'concluidos' },
];

const FILTROS_LOJA = [
    { label: 'Todas as lojas', value: 'todas', activeClass: 'bg-gray-text text-white' },
    { label: 'Prado', value: 'Prado', activeClass: 'bg-orange-base text-white' },
    { label: 'Teresópolis', value: 'Teresopolis', activeClass: 'bg-blue-base text-white' },
];

export default function CoursesAdmin() {

    const {
        cursos,
        loadingCourses,
        addCourses,
        removeCourse,
        editCourse,
        culinaristas
    } = useContext(DadosContext);

    const [form, setForm]               = useState(FORM_VAZIO);
    const [cursoEditar, setCursoEditar] = useState(EDITAR_VAZIO);
    const [step, setStep]               = useState('close');
    const [previewImagemCurso, setPreviewImagemCurso] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('ativos');
    const [filtroLoja, setFiltroLoja]     = useState('todas');
    const [imprimindo, setImprimindo]     = useState(null);
    const [verAssentos, setVerAssentos]   = useState(null);

    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction();
    const { isAdmin } = useContext(AdminAuthContext);

    const [submitted, setSubmitted]         = useState(false);
    const [submittedEdit, setSubmittedEdit] = useState(false);

    const erros = {
        nomeCurso:  submitted && !form.nomeCurso.trim(),
        categoria:  submitted && !form.categoria.trim(),
        data:       submitted && !form.data,
        hora:       submitted && !form.hora,
        duracao:    submitted && !form.duracao.trim(),
        loja:       submitted && !form.loja,
        valor:      submitted && !form.valor.trim(),
    };

    const errosEdit = {
        nomeCurso:  submittedEdit && !cursoEditar.nomeCurso.trim(),
        data:       submittedEdit && !cursoEditar.data,
        hora:       submittedEdit && !cursoEditar.hora,
        loja:       submittedEdit && !cursoEditar.loja,
        duracao:    submittedEdit && !cursoEditar.duracao.trim(),
        valor:      submittedEdit && !cursoEditar.valor.trim(),
        categoria:  submittedEdit && !cursoEditar.categoria.trim(),
    };

    function handleSubmit() {
        setSubmitted(true);
        if (
            !form.nomeCurso.trim() || !form.categoria.trim() ||
            !form.data || !form.hora ||
            !form.duracao.trim() || !form.loja || !form.valor.trim()
        ) return;

        const formData = new FormData();
        formData.append('nomeCurso',   form.nomeCurso.trim());
        formData.append('data',        form.data);
        formData.append('hora',        form.hora);
        formData.append('loja',        form.loja);
        formData.append('culinaristaId', form.culinaristaId);
        formData.append('valor',       valorParaSalvar(form.valor));
        formData.append('duracao',     form.duracao.trim());
        formData.append('categoria',   form.categoria.trim());
        formData.append('ativo',       form.ativo);
        formData.append('ingredientes', form.ingredientes);

        if (form.imagem) formData.append('fotos', form.imagem);

        addCourses(formData);
        setForm(FORM_VAZIO);
        setSubmitted(false);
        setStep('close');
    }

    function abrirAddCurso() {
        setForm(FORM_VAZIO);
        setSubmitted(false);
        setStep('addCourse');
    }

    function fecharAddCurso() {
        setForm(FORM_VAZIO);
        setSubmitted(false);
        setStep('close');
    }

    function handleEditCourse(cursoId) {
        setStep('editCourse');
        const c = cursos.find(c => c.id === cursoId);
        if (!c) return;

        setCursoEditar({
            id:          c.id,
            nomeCurso:   c.nomeCurso,
            data:        c.data,
            hora:        c.hora,
            loja:        c.loja,
            culinaristaId: c.culinaristaId || '',
            valor:       formatValorDisplay(c.valor),
            duracao:     c.duracao,
            categoria:   c.categoria,
            ingredientes: c.ingredientes || '',
            fotos:       c.fotos[0],
            ativo:       c.ativo,
        });

        if (c.fotos?.[0]) setPreviewImagemCurso(c.fotos[0]);
    }

    function editarCourse() {
        setSubmittedEdit(true);
        if (
            !cursoEditar.nomeCurso.trim() || !cursoEditar.data ||
            !cursoEditar.hora || !cursoEditar.loja ||
            !cursoEditar.duracao.trim() || !cursoEditar.valor.trim() ||
            !cursoEditar.categoria.trim()
        ) return;

        const formData = new FormData();
        formData.append('id',          cursoEditar.id);
        formData.append('nomeCurso',   cursoEditar.nomeCurso.trim());
        formData.append('data',        cursoEditar.data);
        formData.append('hora',        cursoEditar.hora);
        formData.append('loja',        cursoEditar.loja);
        formData.append('culinaristaId', cursoEditar.culinaristaId);
        formData.append('valor',       valorParaSalvar(cursoEditar.valor));
        formData.append('duracao',     cursoEditar.duracao.trim());
        formData.append('categoria',   cursoEditar.categoria.trim());
        formData.append('ativo',       cursoEditar.ativo);
        formData.append('ingredientes', cursoEditar.ingredientes || '');

        if (cursoEditar.fotos) formData.append('fotos', cursoEditar.fotos);

        editCourse(formData);
        setCursoEditar(EDITAR_VAZIO);
        setSubmittedEdit(false);
        setStep('close');
    }

    const cursosFiltrados = cursos.filter(c => {
        const passaStatus = filtroStatus === 'ativos'     ? !cursoEncerrado(c)
                          : filtroStatus === 'concluidos' ? cursoEncerrado(c)
                          : true;
        const passaLoja = filtroLoja === 'todas' || c.loja === filtroLoja;
        return passaStatus && passaLoja;
    });

    function closeModal() {
        setCursoEditar(EDITAR_VAZIO);
        setPreviewImagemCurso(null);
        setSubmittedEdit(false);
        setStep('close');
    }

    // lista pra conferir na entrada do curso quem senta onde — só inscrições
    // pagas (quem só reservou e não pagou não vai aparecer) e ordenada por
    // assento, não por ordem de inscrição
    async function abrirListaAssentos(curso) {
        setImprimindo(curso.id);
        try {
            const inscricoes = await getEnrollment(curso.id);
            const confirmadas = inscricoes
                .filter(i => i.status === 'pago')
                .sort((a, b) => a.assento - b.assento);
            setVerAssentos({ curso, lista: confirmadas });
        } catch (err) {
            console.error('Erro ao buscar lista de assentos:', err);
            alert('Erro ao buscar lista de assentos.');
        } finally {
            setImprimindo(null);
        }
    }

    function fieldClass(erro) {
        return `w-full ${erro ? 'ring-1 ring-red-base border-red-base' : ''}`;
    }
    function selectClass(erro) {
        return `p-2 border rounded-md text-gray-text bg-white w-full ${erro ? 'border-red-base ring-1 ring-red-base' : 'border-gray-base'}`;
    }

    return (
        <AdminPage title='Cursos'>

            <Modal
                width='90%'
                maxWidth='800px'
                height='auto'
                isOpen={step === 'addCourse'}
                onClose={fecharAddCurso}
            >
                <div className='mb-6'>
                    <h2 className='text-xl font-bold text-gray-text'>Adicionar Curso</h2>
                    <hr className='border-gray-base/30 w-full mt-3'/>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

                    <div className='flex flex-col gap-1.5 lg:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Curso *</label>
                        <Input
                            type='text'
                            placeholder='Nome do curso'
                            value={form.nomeCurso}
                            className={fieldClass(erros.nomeCurso)}
                            onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                        />
                        {erros.nomeCurso && <p className='text-red-base text-xs'>Informe o nome do curso</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria *</label>
                        <Input
                            type='text'
                            placeholder='Ex: Confeitaria'
                            value={form.categoria}
                            className={fieldClass(erros.categoria)}
                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                        />
                        {erros.categoria && <p className='text-red-base text-xs'>Informe a categoria</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data *</label>
                        <Input
                            type='date'
                            value={form.data}
                            className={fieldClass(erros.data)}
                            onChange={e => setForm({ ...form, data: e.target.value })}
                        />
                        {erros.data && <p className='text-red-base text-xs'>Selecione a data</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário *</label>
                        <Input
                            type='time'
                            value={form.hora}
                            className={fieldClass(erros.hora)}
                            onChange={e => setForm({ ...form, hora: e.target.value })}
                        />
                        {erros.hora && <p className='text-red-base text-xs'>Selecione o horário</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração *</label>
                        <Input
                            type='text'
                            placeholder='Ex: 2h ou 1h30min'
                            value={form.duracao}
                            className={fieldClass(erros.duracao)}
                            onChange={e => setForm({ ...form, duracao: maskDuracao(e.target.value) })}
                        />
                        {erros.duracao && <p className='text-red-base text-xs'>Informe a duração</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja *</label>
                        <select
                            value={form.loja}
                            onChange={e => setForm({ ...form, loja: e.target.value })}
                            className={selectClass(erros.loja)}
                        >
                            <option value=''>Selecione a loja</option>
                            <option value='Prado'>Prado</option>
                            <option value='Teresopolis'>Teresopolis</option>
                        </select>
                        {erros.loja && <p className='text-red-base text-xs'>Selecione a loja</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                        <select
                            value={form.culinaristaId}
                            onChange={e => setForm({ ...form, culinaristaId: e.target.value })}
                            className={selectClass(false)}
                        >
                            <option value=''>Selecione a culinarista</option>
                            {culinaristas === null
                                ? null
                                : culinaristas.map(c =>
                                    <option key={c.id} value={c.id}>{c.nomeCulinarista}</option>
                                )
                            }
                        </select>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor *</label>
                        <div className={`flex items-center border rounded-md overflow-hidden ${erros.valor ? 'border-red-base ring-1 ring-red-base' : 'border-gray-base'}`}>
                            <span className='px-2 text-sm text-gray-text/60 bg-gray border-r border-gray-base h-full flex items-center'>R$</span>
                            <input
                                type='text'
                                placeholder='0,00'
                                inputMode='decimal'
                                value={form.valor}
                                className='flex-1 p-2 text-sm text-gray-text bg-white outline-none'
                                onFocus={e => e.target.select()}
                                onChange={e => setForm({ ...form, valor: maskValor(e.target.value) })}
                            />
                        </div>
                        {erros.valor && <p className='text-red-base text-xs'>Informe o valor do curso</p>}
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Imagem</label>
                        <Input
                            type='file'
                            accept='image/png, image/jpeg'
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setForm(prev => ({ ...prev, imagem: file }));
                            }}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Ingredientes</label>
                        <textarea
                            placeholder={'Digite um ingrediente por linha\nEx: 200g de farinha de trigo\n3 ovos\n1 xícara de açúcar'}
                            value={form.ingredientes}
                            onChange={e => setForm({ ...form, ingredientes: e.target.value })}
                            rows={4}
                            className='p-2 border border-gray-base rounded-md text-gray-text bg-white resize-y text-sm'
                        />
                    </div>
                </div>

                <Button
                    className='bg-orange-base hover:bg-orange-light text-white w-full mt-6'
                    onClick={handleSubmit}
                >
                    Adicionar Curso
                </Button>
            </Modal>

            <CardDash className='bg-white w-full rounded-md p-8 shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                        <p className='font-bold text-xl text-gray-text'>CURSOS</p>
                        <Button onClick={abrirAddCurso} className='bg-orange-base hover:bg-orange-light text-white w-fit'>
                            + Adicionar Curso
                        </Button>
                    </div>
                    <FilterPills value={filtroStatus} onChange={setFiltroStatus} options={FILTROS_STATUS} />
                    <FilterPills value={filtroLoja} onChange={setFiltroLoja} options={FILTROS_LOJA} />
                </div>
                <hr className='border-gray-base/30 w-full mb-4'/>

                <div className='max-h-112.5 overflow-y-auto'>
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
                    {loadingCourses ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                            <Loader2 size={28} className='animate-spin text-orange-base' />
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
                                <div className='md:hidden p-3 text-gray-text'>
                                    <div className='flex items-center gap-2'>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${!cursoEncerrado(curso) ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                        <p className='font-semibold'>{curso.nomeCurso}</p>
                                    </div>
                                    <p className='text-sm text-gray-text/70 mt-0.5'>{curso.culinarista} · {formatDateBR(curso.data)} · {curso.hora}</p>
                                    {curso.loja === 'Prado'
                                        ? <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                        : <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                    }
                                    <div className='flex gap-2 mt-2'>
                                        {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                title: 'Excluir curso',
                                message: `Excluir o curso "${curso.nomeCurso}"? Inscrições não pagas também serão removidas.`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeCourse(curso.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        )}
                                        <Tooltip label='Ver lista de assentos'>
                                            <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => abrirListaAssentos(curso)} disabled={imprimindo === curso.id}>
                                                {imprimindo === curso.id ? <Loader2 size={16} className='animate-spin' /> : <Printer size={16} />}
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label='Editar'>
                                            <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEditCourse(curso.id)}>
                                                <Edit size={16} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                                px-3 py-3 items-center text-gray-text text-sm
                                                hover:bg-gray/60 transition-colors rounded-md'>
                                    <p className='font-medium truncate pr-2'>{curso.nomeCurso}</p>
                                    <p className='truncate'>{curso.culinarista}</p>
                                    <div className='flex items-center gap-1.5'>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${!cursoEncerrado(curso) ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                        <p>{formatDateBR(curso.data)}</p>
                                    </div>
                                    <p>{curso.hora}</p>
                                    {curso.loja === 'Prado'
                                        ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{curso.loja}</span>
                                        : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{curso.loja}</span>
                                    }
                                    <div className='flex gap-2'>
                                        {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                title: 'Excluir curso',
                                message: `Excluir o curso "${curso.nomeCurso}"? Inscrições não pagas também serão removidas.`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeCourse(curso.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        )}
                                        <Tooltip label='Ver lista de assentos'>
                                            <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => abrirListaAssentos(curso)} disabled={imprimindo === curso.id}>
                                                {imprimindo === curso.id ? <Loader2 size={16} className='animate-spin' /> : <Printer size={16} />}
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
                onClose={closeModal}
            >
                <div className='mb-6'>
                    <h2 className='text-xl font-bold text-gray-text'>Editar Curso</h2>
                    <hr className='border-gray-base/30 w-full mt-3'/>
                </div>

                <div className='flex items-start gap-5 mb-6 p-4 bg-gray rounded-lg'>
                    {!previewImagemCurso && cursoEditar.fotos === null
                        ? <div className='w-28 h-28 shrink-0 rounded-lg bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>Sem foto</div>
                        : <img src={previewImagemCurso || cursoEditar.fotos} className='w-28 h-28 shrink-0 object-cover rounded-lg' />
                    }
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Alterar Foto</label>
                        <Input
                            type='file'
                            accept='image/png, image/jpeg'
                            onChange={e => {
                                const file = e.target.files[0];
                                if (!file) return;
                                if (!file.type.startsWith('image/')) { alert('Selecione uma imagem válida'); return; }
                                setCursoEditar(prev => ({ ...prev, fotos: file }));
                                setPreviewImagemCurso(URL.createObjectURL(file));
                            }}
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Descrição *</label>
                        <Input
                            value={cursoEditar.nomeCurso}
                            className={fieldClass(errosEdit.nomeCurso)}
                            onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                        />
                        {errosEdit.nomeCurso && <p className='text-red-base text-xs'>Informe o nome do curso</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data *</label>
                        <Input
                            type='date'
                            value={cursoEditar.data}
                            className={fieldClass(errosEdit.data)}
                            onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                        />
                        {errosEdit.data && <p className='text-red-base text-xs'>Selecione a data</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário *</label>
                        <Input
                            type='time'
                            value={cursoEditar.hora}
                            className={fieldClass(errosEdit.hora)}
                            onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                        />
                        {errosEdit.hora && <p className='text-red-base text-xs'>Selecione o horário</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja *</label>
                        <select
                            className={selectClass(errosEdit.loja)}
                            value={cursoEditar.loja}
                            onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                        >
                            <option value=''>Selecione a loja</option>
                            <option value='Prado'>Prado</option>
                            <option value='Teresopolis'>Teresopolis</option>
                        </select>
                        {errosEdit.loja && <p className='text-red-base text-xs'>Selecione a loja</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                        <select
                            className={selectClass(false)}
                            value={cursoEditar.culinaristaId}
                            onChange={e => setCursoEditar({ ...cursoEditar, culinaristaId: e.target.value })}
                        >
                            {culinaristas === null
                                ? <option>Nenhuma encontrada</option>
                                : culinaristas.map(c =>
                                    <option key={c.id} value={c.id}>{c.nomeCulinarista}</option>
                                )
                            }
                        </select>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor *</label>
                        <div className={`flex items-center border rounded-md overflow-hidden ${errosEdit.valor ? 'border-red-base ring-1 ring-red-base' : 'border-gray-base'}`}>
                            <span className='px-2 text-sm text-gray-text/60 bg-gray border-r border-gray-base h-full flex items-center'>R$</span>
                            <input
                                type='text'
                                placeholder='0,00'
                                inputMode='decimal'
                                value={cursoEditar.valor}
                                className='flex-1 p-2 text-sm text-gray-text bg-white outline-none'
                                onFocus={e => e.target.select()}
                                onChange={e => setCursoEditar({ ...cursoEditar, valor: maskValor(e.target.value) })}
                            />
                        </div>
                        {errosEdit.valor && <p className='text-red-base text-xs'>Informe o valor do curso</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração *</label>
                        <Input
                            placeholder='Ex: 2h ou 1h30min'
                            value={cursoEditar.duracao}
                            className={fieldClass(errosEdit.duracao)}
                            onChange={e => setCursoEditar({ ...cursoEditar, duracao: maskDuracao(e.target.value) })}
                        />
                        {errosEdit.duracao && <p className='text-red-base text-xs'>Informe a duração</p>}
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria *</label>
                        <Input
                            value={cursoEditar.categoria}
                            className={fieldClass(errosEdit.categoria)}
                            onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                        />
                        {errosEdit.categoria && <p className='text-red-base text-xs'>Informe a categoria</p>}
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Ingredientes</label>
                        <textarea
                            placeholder='Digite um ingrediente por linha'
                            value={cursoEditar.ingredientes}
                            onChange={e => setCursoEditar({ ...cursoEditar, ingredientes: e.target.value })}
                            rows={4}
                            className='p-2 border border-gray-base rounded-md text-gray-text bg-white resize-y text-sm'
                        />
                    </div>
                </div>

                <Button
                    className='w-full bg-orange-base hover:bg-orange-light text-white'
                    onClick={() => ask({
                        title: 'Salvar alterações',
                        message: 'Salvar as alterações deste curso?',
                        variant: 'neutral',
                        confirmLabel: 'Salvar',
                        onConfirm: editarCourse
                    })}
                >
                    Salvar Edições
                </Button>
            </Modal>

            <Modal
                width='90%'
                maxWidth='600px'
                height='auto'
                isOpen={!!verAssentos}
                onClose={() => setVerAssentos(null)}
            >
                {verAssentos && (
                    <>
                        <div className='mb-4'>
                            <h2 className='text-xl font-bold text-gray-text'>{verAssentos.curso.nomeCurso}</h2>
                            <p className='text-sm text-gray-text/60'>
                                {formatDateBR(verAssentos.curso.data)} às {verAssentos.curso.hora} · {verAssentos.lista.length} inscrição(ões) confirmada(s)
                            </p>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        <div className='max-h-100 overflow-y-auto'>
                            {verAssentos.lista.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                                    <Inbox size={36} />
                                    <p className='text-sm'>Nenhuma inscrição paga</p>
                                </div>
                            ) : (
                                <>
                                    <div className='grid grid-cols-[0.6fr_1.5fr_1fr] gap-2
                                                    text-xs font-semibold text-gray-text uppercase tracking-wider
                                                    bg-gray px-3 py-2 rounded-md mb-1 sticky top-0'>
                                        <p>Assento</p>
                                        <p>Nome</p>
                                        <p>CPF</p>
                                    </div>
                                    {verAssentos.lista.map(i => (
                                        <div key={i.id}>
                                            <div className='grid grid-cols-[0.6fr_1.5fr_1fr] gap-2 px-3 py-2.5 items-center text-gray-text text-sm'>
                                                <p className='font-semibold'>{i.assento}</p>
                                                <p className='truncate'>{i.nome}</p>
                                                <p>{i.cpf}</p>
                                            </div>
                                            <hr className='border-gray-base/20'/>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </>
                )}
            </Modal>

            <ConfirmModal
                isOpen={!!confirm}
                title={confirm?.title || 'Confirmação'}
                message={confirm?.message}
                variant={confirm?.variant}
                confirmLabel={confirm?.confirmLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />

        </AdminPage>
    )
}
