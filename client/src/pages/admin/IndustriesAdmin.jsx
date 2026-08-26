import { useContext, useState } from 'react';
import { Trash, Edit, Inbox, Search, Loader2 } from 'lucide-react';

import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import Tooltip from '../../components/admin/Tooltip';
import ConfirmModal from '../../components/admin/ModalConfirm';
import AdminPage from '../../layouts/admin/AdminPage';

import { DadosContext } from '../../contexts/DadosContext';
import { AdminAuthContext } from '../../contexts/AdminAuthContext';
import useConfirmAction from '../../hooks/useConfirmAction';

const INDUSTRIA_VAZIA = {
    razaoSocial: '',
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    instagram: '',
    site: '',
    foto: null
};

export default function IndustriesAdmin() {
    const {
        industrias,
        loadingIndustries,
        addIndustry,
        removeIndustry,
        editIndustry
    } = useContext(DadosContext);

    const [formIndustria, setFormIndustria] = useState(INDUSTRIA_VAZIA);
    const [industriaEditar, setIndustriaEditar] = useState({});
    const [step, setStep] = useState('close');
    const [busca, setBusca] = useState('');

    const industriasFiltradas = industrias.filter(i =>
        i.nome.toLowerCase().includes(busca.trim().toLowerCase())
    );

    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction();
    const { isAdmin } = useContext(AdminAuthContext);

    function handleSubmitIndustria() {
        if (!formIndustria.nome || !formIndustria.razaoSocial) {
            alert('Nome e Razão Social são obrigatórios');
            return;
        }

        const formData = new FormData();

        Object.entries(formIndustria).forEach(([key, value]) => {
            if (value) formData.append(key, value);
        });

        addIndustry(formData);
        setFormIndustria(INDUSTRIA_VAZIA);
        setStep('close');
    }

    function abrirAddIndustria() {
        setFormIndustria(INDUSTRIA_VAZIA);
        setStep('add');
    }

    function fecharAddIndustria() {
        setFormIndustria(INDUSTRIA_VAZIA);
        setStep('close');
    }

    function handleEditIndustria(id) {
        const industria = industrias.find(i => i.id === id);
        setIndustriaEditar(industria);
        setStep('edit');
    }

    async function salvarEdicao() {
        const formData = new FormData();

        formData.append('id', industriaEditar.id);

        Object.entries(industriaEditar).forEach(([key, value]) => {
            if (value === undefined || value === null) return;

            if (key === 'foto') {
                if (value instanceof File) {
                    formData.append('foto', value);
                }
            } else {
                formData.append(key, value);
            }
        });

        await editIndustry(formData);
        setStep('close');
    }

    function closeModal() {
        setIndustriaEditar({});
        setStep('close');
    }

    return (
        <AdminPage title='Indústrias'>

            <Modal
                isOpen={step === 'add'}
                onClose={fecharAddIndustria}
                width='90%'
                maxWidth='700px'
            >
                <div className='mb-6'>
                    <h2 className='text-xl font-bold text-gray-text'>Adicionar Indústria</h2>
                    <hr className='border-gray-base/30 w-full mt-3'/>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Razão Social</label>
                        <Input placeholder='Razão Social'
                            value={formIndustria.razaoSocial}
                            onChange={e => setFormIndustria({ ...formIndustria, razaoSocial: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome Fantasia</label>
                        <Input placeholder='Nome Fantasia'
                            value={formIndustria.nome}
                            onChange={e => setFormIndustria({ ...formIndustria, nome: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>CNPJ</label>
                        <Input placeholder='CNPJ'
                            value={formIndustria.cnpj}
                            onChange={e => setFormIndustria({ ...formIndustria, cnpj: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Telefone</label>
                        <Input placeholder='Telefone'
                            value={formIndustria.telefone}
                            onChange={e => setFormIndustria({ ...formIndustria, telefone: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Email</label>
                        <Input placeholder='Email'
                            value={formIndustria.email}
                            onChange={e => setFormIndustria({ ...formIndustria, email: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Instagram</label>
                        <Input placeholder='Instagram'
                            value={formIndustria.instagram}
                            onChange={e => setFormIndustria({ ...formIndustria, instagram: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Site</label>
                        <Input placeholder='Site'
                            value={formIndustria.site}
                            onChange={e => setFormIndustria({ ...formIndustria, site: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Endereço</label>
                        <Input placeholder='Endereço'
                            value={formIndustria.endereco}
                            onChange={e => setFormIndustria({ ...formIndustria, endereco: e.target.value })}
                        />
                    </div>

                    <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Foto</label>
                        <Input
                            type='file'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;
                                setFormIndustria(prev => ({ ...prev, foto: file }));
                            }}
                        />
                    </div>

                    <div className='md:col-span-2 lg:col-span-3 mt-2'>
                        <Button
                            onClick={handleSubmitIndustria}
                            className='bg-orange-base text-white w-full hover:bg-orange-light'
                        >
                            Adicionar Indústria
                        </Button>
                    </div>

                </div>
            </Modal>

            <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                <div className='flex flex-col gap-3 mb-4'>
                    <div className='flex items-center justify-between'>
                        <p className='font-bold text-gray-text'>INDÚSTRIAS</p>
                        <Button onClick={abrirAddIndustria} className='bg-orange-base hover:bg-orange-light text-white w-fit'>
                            + Adicionar Indústria
                        </Button>
                    </div>
                    <div className='relative w-full md:max-w-xs'>
                        <Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-gray-text/40' />
                        <input
                            type='text'
                            placeholder='Buscar por nome'
                            value={busca}
                            onChange={e => setBusca(e.target.value)}
                            className='w-full text-sm border border-gray-base/30 rounded-md pl-9 pr-3 py-2 text-gray-text outline-none focus:border-orange-base'
                        />
                    </div>
                </div>

                <div className='max-h-100 overflow-y-auto'>

                    <div className='hidden md:grid grid-cols-[auto_1fr_1fr_0.8fr_0.8fr_auto] gap-2
                                    text-xs font-semibold text-gray-text uppercase tracking-wider
                                    bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                        <p></p>
                        <p>Nome Fantasia</p>
                        <p>Razão Social</p>
                        <p>CNPJ</p>
                        <p>Telefone</p>
                        <p>Ações</p>
                    </div>

                    {loadingIndustries ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                            <Loader2 size={28} className='animate-spin text-orange-base' />
                            <p className='text-sm'>Carregando...</p>
                        </div>
                    ) : industriasFiltradas.length === 0 ? (
                        <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                            <Inbox size={36} />
                            <p className='text-sm'>Nenhuma indústria encontrada</p>
                        </div>
                    ) : (
                        industriasFiltradas.map(i => (
                            <div key={i.id}>
                                <div className='md:hidden p-3 text-gray-text'>
                                    <div className='flex items-center gap-2'>
                                        {i.foto
                                            ? <img src={i.foto} className='w-8 h-8 rounded-full object-cover shrink-0' />
                                            : <div className='w-8 h-8 rounded-full bg-gray-base/20 shrink-0' />
                                        }
                                        <p className='font-semibold'>{i.nome}</p>
                                    </div>
                                    <p className='text-sm text-gray-text/70'>{i.razaoSocial}</p>
                                    {i.cnpj && <p className='text-sm text-gray-text/70'>CNPJ: {i.cnpj}</p>}
                                    {i.telefone && <p className='text-sm text-gray-text/70'>Tel: {i.telefone}</p>}
                                    <div className='flex gap-2 mt-2'>
                                        {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base text-white p-2 hover:bg-red-light' onClick={() => ask({
                                title: 'Excluir indústria',
                                message: `Excluir a indústria "${i.nome}"?`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeIndustry(i.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        )}
                                        <Tooltip label='Editar'>
                                            <Button className='bg-orange-base text-white p-2 hover:bg-orange-light' onClick={() => handleEditIndustria(i.id)}>
                                                <Edit size={16} />
                                            </Button>
                                        </Tooltip>
                                    </div>
                                </div>

                                <div className='hidden md:grid grid-cols-[auto_1fr_1fr_0.8fr_0.8fr_auto] gap-2
                                                px-3 py-3 items-center text-gray-text text-sm
                                                hover:bg-gray/60 transition-colors rounded-md'>
                                    {i.foto
                                        ? <img src={i.foto} className='w-7 h-7 rounded-full object-cover shrink-0' />
                                        : <div className='w-7 h-7 rounded-full bg-gray-base/20 shrink-0' />
                                    }
                                    <p className='font-medium truncate'>{i.nome}</p>
                                    <p className='truncate'>{i.razaoSocial}</p>
                                    <p>{i.cnpj || '-'}</p>
                                    <p>{i.telefone || '-'}</p>
                                    <div className='flex gap-2'>
                                        {isAdmin && (
                                        <Tooltip label='Excluir'>
                                            <Button className='bg-red-base text-white p-2 hover:bg-red-light' onClick={() => ask({
                                title: 'Excluir indústria',
                                message: `Excluir a indústria "${i.nome}"?`,
                                variant: 'danger',
                                confirmLabel: 'Excluir',
                                onConfirm: () => removeIndustry(i.id)
                            })}>
                                                <Trash size={16} />
                                            </Button>
                                        </Tooltip>
                                        )}
                                        <Tooltip label='Editar'>
                                            <Button className='bg-orange-base text-white p-2 hover:bg-orange-light' onClick={() => handleEditIndustria(i.id)}>
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
                    <h2 className='text-xl font-bold text-gray-text'>Editar Indústria</h2>
                    <hr className='border-gray-base/30 w-full mt-3'/>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome Fantasia</label>
                        <Input
                            placeholder='Nome'
                            value={industriaEditar.nome || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, nome: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Razão Social</label>
                        <Input
                            placeholder='Razão Social'
                            value={industriaEditar.razaoSocial || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, razaoSocial: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>CNPJ</label>
                        <Input
                            placeholder='CNPJ'
                            value={industriaEditar.cnpj || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, cnpj: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Telefone</label>
                        <Input
                            placeholder='Telefone'
                            value={industriaEditar.telefone || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, telefone: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Email</label>
                        <Input
                            placeholder='Email'
                            value={industriaEditar.email || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, email: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Instagram</label>
                        <Input
                            placeholder='Instagram'
                            value={industriaEditar.instagram || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, instagram: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Site</label>
                        <Input
                            placeholder='Site'
                            value={industriaEditar.site || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, site: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Endereço</label>
                        <Input
                            placeholder='Endereço'
                            value={industriaEditar.endereco || ''}
                            onChange={e => setIndustriaEditar({ ...industriaEditar, endereco: e.target.value })}
                        />
                    </div>
                    <div className='flex flex-col gap-1.5 md:col-span-2'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Foto</label>
                        <Input
                            type='file'
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (!file) return;

                                setIndustriaEditar(prev => ({
                                    ...prev,
                                    foto: file
                                }));
                            }}
                        />
                    </div>
                </div>

                <Button
                    onClick={() => ask({
                        title: 'Salvar alterações',
                        message: 'Salvar as alterações desta indústria?',
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
