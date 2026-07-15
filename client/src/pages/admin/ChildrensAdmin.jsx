import { useContext, useState } from 'react';
import { Trash, Edit, Inbox } from 'lucide-react';

import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import Tooltip from '../../components/admin/Tooltip';
import ConfirmModal from '../../components/admin/ModalConfirm';
import FilterPills from '../../components/admin/FilterPills';
import AdminPage from '../../layouts/admin/AdminPage';

import { DadosContext } from '../../contexts/DadosContext';
import useConfirmAction from '../../hooks/useConfirmAction';
import { formatDateBR } from '../../utils/formatDate';

const CURSO_VAZIO = {
    nomeCurso: '',
    data: '',
    hora: '',
    loja: '',
    culinarista: '',
    valor: '',
    duracao: '',
    categoria: '',
    fotos: null
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

export default function ChildrensAdmin() {

    const {
        cursosInfantis = [],
        addCursoInfantil,
        removeCursoInfantil,
        editCursoInfantil,
        culinaristas
    } = useContext(DadosContext);

    const [form, setForm] = useState(CURSO_VAZIO);
    const [cursoEditar, setCursoEditar] = useState({});
    const [step, setStep] = useState('close');
    const [previewImagem, setPreviewImagem] = useState(null);

    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction();

    const [filtroStatus, setFiltroStatus] = useState('todos');
    const [filtroLoja, setFiltroLoja] = useState('todas');

    const hoje = new Date().toISOString().split('T')[0];
    const cursosFiltrados = cursosInfantis.filter(c => {
        const passaStatus = filtroStatus === 'ativos' ? c.data >= hoje
                          : filtroStatus === 'concluidos' ? c.data < hoje
                          : true;
        const passaLoja = filtroLoja === 'todas' || c.loja === filtroLoja;
        return passaStatus && passaLoja;
    });

    function handleSubmit() {
        if (!form.nomeCurso || !form.data || !form.hora || !form.loja) {
            alert('Preencha os campos obrigatórios');
            return;
        }

        const formData = new FormData();

        Object.entries(form).forEach(([key, value]) => {
            if (!value) return;
            formData.append(key, value);
        });

        addCursoInfantil(formData);
        setForm(CURSO_VAZIO);
    }

    function handleEdit(id) {
        const curso = cursosInfantis.find(c => c.id === id);
        if (!curso) return;

        setCursoEditar(curso);
        setStep('edit');

        if (curso.fotos?.[0]) {
            setPreviewImagem(curso.fotos[0]);
        }
    }

    function salvarEdicao() {
        const formData = new FormData();

        formData.append('id', cursoEditar.id);

        Object.entries(cursoEditar).forEach(([key, value]) => {
            if (!value) return;

            if (key === 'fotos') {
                if (value instanceof File) {
                    formData.append('fotos', value);
                }
            } else {
                formData.append(key, value);
            }
        });

        editCursoInfantil(formData);
        setStep('close');
    }

    function closeModal() {
        setCursoEditar({});
        setPreviewImagem(null);
        setStep('close');
    }

    return (
        <AdminPage title='Cursos Infantis'>

            <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                <p className='font-bold text-gray-text mb-6'>CADASTRE UM CURSO INFANTIL</p>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

                    <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Curso</label>
                        <Input placeholder='Nome do curso'
                            value={form.nomeCurso}
                            onChange={e => setForm({ ...form, nomeCurso: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                        <Input type='date'
                            value={form.data}
                            onChange={e => setForm({ ...form, data: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                        <Input type='time'
                            value={form.hora}
                            onChange={e => setForm({ ...form, hora: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                        <select value={form.loja}
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
                        <select value={form.culinarista}
                            onChange={e => setForm({ ...form, culinarista: e.target.value })}
                            className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                        >
                            <option value=''>Selecione a culinarista</option>
                            {culinaristas?.map(c => (
                                <option key={c.id} value={c.nomeCulinarista}>
                                    {c.nomeCulinarista}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                        <Input placeholder='Valor'
                            value={form.valor}
                            onChange={e => setForm({ ...form, valor: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                        <Input placeholder='Duração'
                            value={form.duracao}
                            onChange={e => setForm({ ...form, duracao: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                        <Input placeholder='Categoria'
                            value={form.categoria}
                            onChange={e => setForm({ ...form, categoria: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Imagem</label>
                        <Input
                            type='file'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setForm(prev => ({ ...prev, fotos: file }));
                            }}
                        />
                    </div>

                    <div className='md:col-span-2 lg:col-span-3 mt-2'>
                        <Button
                            onClick={handleSubmit}
                            className='bg-orange-base text-white w-full hover:bg-orange-light'
                        >
                            Adicionar Curso Infantil
                        </Button>
                    </div>

                </div>
            </CardDash>

            <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
                        <p className='font-bold text-xl text-gray-text'>CURSOS INFANTIS</p>
                        <FilterPills value={filtroStatus} onChange={setFiltroStatus} options={FILTROS_STATUS} />
                    </div>
                    <FilterPills value={filtroLoja} onChange={setFiltroLoja} options={FILTROS_LOJA} />
                </div>
                <hr className='border-gray-base/30 w-full mb-4'/>

                <div className='max-h-100 overflow-y-auto'>

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

                    {cursosFiltrados.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                            <Inbox size={36} />
                            <p className='text-sm'>Nenhum curso infantil encontrado</p>
                        </div>
                    ) : (
                        cursosFiltrados.map((c, i) => (
                            <div key={i}>
                                <div className='md:hidden p-3 text-gray-text'>
                                    <div className='flex items-center gap-2'>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.data >= hoje ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                        <p className='font-semibold'>{c.nomeCurso}</p>
                                    </div>
                                    <p className='text-sm text-gray-text/70 mt-0.5'>{c.culinarista} · {formatDateBR(c.data)} · {c.hora}</p>
                                    {c.loja === 'Prado'
                                        ? <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-orange-base/10 text-orange-base'>{c.loja}</span>
                                        : <span className='text-xs font-semibold mt-1 inline-block px-2 py-0.5 rounded-full bg-blue-base/20 text-blue-base'>{c.loja}</span>
                                    }
                                    <div className='flex gap-2 mt-2'>
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                title: 'Excluir curso infantil',
                                message: `Excluir o curso infantil "${c.nomeCurso}"?`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeCursoInfantil(c.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label='Editar'>
                                            <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEdit(c.id)}>
                                                <Edit size={16} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className='hidden md:grid grid-cols-[2fr_1fr_0.7fr_0.6fr_0.7fr_auto] gap-2
                                                px-3 py-3 items-center text-gray-text text-sm
                                                hover:bg-gray/60 transition-colors rounded-md'>
                                    <p className='font-medium truncate pr-2'>{c.nomeCurso}</p>
                                    <p className='truncate'>{c.culinarista}</p>
                                    <div className='flex items-center gap-1.5'>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${c.data >= hoje ? 'bg-green-base' : 'bg-gray-base/40'}`} />
                                        <p>{formatDateBR(c.data)}</p>
                                    </div>
                                    <p>{c.hora}</p>
                                    {c.loja === 'Prado'
                                        ? <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-orange-base/10 text-orange-base'>{c.loja}</span>
                                        : <span className='text-xs font-semibold px-2 py-1 rounded-full w-fit bg-blue-base/20 text-blue-base'>{c.loja}</span>
                                    }
                                    <div className='flex gap-2'>
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => ask({
                                title: 'Excluir curso infantil',
                                message: `Excluir o curso infantil "${c.nomeCurso}"?`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeCursoInfantil(c.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        <Tooltip label='Editar'>
                                            <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEdit(c.id)}>
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
                isOpen={step === 'edit'}
                onClose={closeModal}
                width='90%'
                maxWidth='700px'
            >
                <div className='mb-6'>
                    <h2 className='text-xl font-bold text-gray-text'>Editar Curso Infantil</h2>
                    <hr className='border-gray-base/30 w-full mt-3'/>
                </div>

                <div className='flex items-start gap-5 mb-6 p-4 bg-gray rounded-lg'>
                    {previewImagem
                        ? <img src={previewImagem} className='w-28 h-28 shrink-0 object-cover rounded-lg'/>
                        : <div className='w-28 h-28 shrink-0 rounded-lg bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>
                            Sem foto
                          </div>
                    }
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Alterar Foto</label>
                        <Input
                            type='file'
                            accept='image/*'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setCursoEditar(prev => ({ ...prev, fotos: file }));
                                setPreviewImagem(URL.createObjectURL(file));
                            }}
                        />
                    </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome do Curso</label>
                        <Input
                            value={cursoEditar.nomeCurso || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, nomeCurso: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Data</label>
                        <Input
                            type='date'
                            value={cursoEditar.data || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, data: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Horário</label>
                        <Input
                            type='time'
                            value={cursoEditar.hora || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, hora: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Loja</label>
                        <select
                            className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                            value={cursoEditar.loja || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, loja: e.target.value })}
                        >
                            <option value=''>Selecione a loja</option>
                            <option value='Prado'>Prado</option>
                            <option value='Teresopolis'>Teresopolis</option>
                        </select>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Culinarista</label>
                        <select
                            className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                            value={cursoEditar.culinarista || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, culinarista: e.target.value })}
                        >
                            <option value=''>Selecione a culinarista</option>
                            {culinaristas?.map(c => (
                                <option key={c.id} value={c.nomeCulinarista}>{c.nomeCulinarista}</option>
                            ))}
                        </select>
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Valor</label>
                        <Input
                            value={cursoEditar.valor || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, valor: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Duração</label>
                        <Input
                            value={cursoEditar.duracao || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, duracao: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Categoria</label>
                        <Input
                            value={cursoEditar.categoria || ''}
                            onChange={e => setCursoEditar({ ...cursoEditar, categoria: e.target.value })}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => ask({
                        title: 'Salvar alterações',
                        message: 'Salvar as alterações deste curso infantil?',
                        variant: 'neutral',
                        confirmLabel: 'Salvar',
                        onConfirm: salvarEdicao
                    })}
                    className='bg-orange-base text-white w-full hover:bg-orange-light'
                >
                    Salvar Edições
                </Button>
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
    );
}
