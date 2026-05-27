// Head
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState } from 'react';

// Icons
import { Trash, Edit } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';

// Context
import { DadosContext } from '../../contexts/DadosContext';

export default function IndustriesAdmin() {
    const { 
        industrias,
        addIndustry,
        removeIndustry,
        editIndustry
    } = useContext(DadosContext);

    // ================= STATES =================
    const [formIndustria, setFormIndustria] = useState({
        razaoSocial: '',
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        instagram: '',
        site: '',
        foto: null
    });

    const [industriaEditar, setIndustriaEditar] = useState({});
    const [step, setStep] = useState('close');

    // ================= CREATE =================
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

        setFormIndustria({
            razaoSocial: '',
            nome: '',
            cnpj: '',
            telefone: '',
            email: '',
            endereco: '',
            instagram: '',
            site: '',
            foto: null
        });
    }

    // ================= EDIT =================
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
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Industrias'/>
            <SideBar />

            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Indústrias'} />

                <section className='flex flex-col gap-10 mt-10 w-[92dvw] lg:w-[78vw]'>

                    {/* FORM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-6'>CADASTRE UMA INDÚSTRIA</p>

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
                    </CardDash>

                    {/* LISTAGEM */}
                    <CardDash className='bg-white p-10 rounded-md shadow-sm'>
                        <p className='font-bold text-gray-text mb-4'>INDÚSTRIAS</p>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>Nome Fantasia</p>
                                <p>Razão Social</p>
                                <p>CNPJ</p>
                                <p>Telefone</p>
                                <p>Ações</p>
                            </div>

                            {industrias.length === 0 ? (
                                <p className='text-gray-text text-center py-8'>Nenhuma indústria cadastrada</p>
                            ) : (
                                industrias.map(i => (
                                    <div key={i.id}>
                                        {/* MOBILE */}
                                        <div className='md:hidden p-3 text-gray-text'>
                                            <p className='font-semibold'>{i.nome}</p>
                                            <p className='text-sm text-gray-text/70'>{i.razaoSocial}</p>
                                            {i.cnpj && <p className='text-sm text-gray-text/70'>CNPJ: {i.cnpj}</p>}
                                            {i.telefone && <p className='text-sm text-gray-text/70'>Tel: {i.telefone}</p>}
                                            <div className='flex gap-2 mt-2'>
                                                <Button
                                                    className='bg-red-base text-white p-2 hover:bg-red-light'
                                                    onClick={() => removeIndustry(i.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                                <Button
                                                    className='bg-orange-base text-white p-2 hover:bg-orange-light'
                                                    onClick={() => handleEditIndustria(i.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[1fr_1fr_0.8fr_0.8fr_auto] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <p className='font-medium truncate'>{i.nome}</p>
                                            <p className='truncate'>{i.razaoSocial}</p>
                                            <p>{i.cnpj || '-'}</p>
                                            <p>{i.telefone || '-'}</p>
                                            <div className='flex gap-2'>
                                                <Button
                                                    className='bg-red-base text-white p-2 hover:bg-red-light'
                                                    onClick={() => removeIndustry(i.id)}
                                                >
                                                    <Trash size={16} />
                                                </Button>
                                                <Button
                                                    className='bg-orange-base text-white p-2 hover:bg-orange-light'
                                                    onClick={() => handleEditIndustria(i.id)}
                                                >
                                                    <Edit size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                        <hr className='border-gray-base/20'/>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardDash>

                    {/* MODAL EDIT */}
                    <Modal
                        isOpen={step === 'edit'}
                        onClose={closeModal}
                        width='90%'
                        maxWidth='700px'
                    >
                        {/* HEADER */}
                        <div className='mb-6'>
                            <h2 className='text-xl font-bold text-gray-text'>Editar Indústria</h2>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        {/* CAMPOS */}
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
                            onClick={salvarEdicao}
                            className='bg-orange-base text-white w-full hover:bg-orange-light'
                        >
                            Salvar Edições
                        </Button>
                    </Modal>

                </section>
            </main>
        </div>
    );
}