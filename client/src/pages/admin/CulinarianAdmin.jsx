// Head
import { Head } from '../../components/Head'

// Layouts
import SideBar from '../../layouts/admin/SideBar'
import TopBar from '../../layouts/admin/TopBar'

// React
import { useContext, useState } from 'react';

// LUCIDE ICONS
import { Trash, Edit, Users, Plus, X, Inbox } from 'lucide-react';

// Components
import Input from '../../components/Input'
import CardDash from '../../components/admin/CardDash'
import Button from '../../components/Button';
import Modal from '../../components/public/Modal';
import Tooltip from '../../components/admin/Tooltip';
import ConfirmModal from '../../components/admin/ModalConfirm';

// DB
import { DadosContext } from '../../contexts/DadosContext';

export default function CulinarianAdmin() {
    const { 
            culinaristas,
            addCulinarian,
            removeCulinarian,
            editCulinarian,
            industrias
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

    // controle de confirmação (exclusão/edição)
    const [confirm, setConfirm] = useState(null); // { message, onConfirm }
    // ============== STATES ==============

    // ============== POST ==============
    // ======= CADASTRO CULINARISTA
    function handleSubmitCulinarian() {
        if(!formCulinarian.nomeCulinarista || !formCulinarian.cpf) {
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

            const data = culinaristas;
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
        <div className='flex w-full min-h-screen bg-gray overflow-x-hidden'>
            <Head title='Admin | Culinaristas'/>
            <SideBar />
            <main className='flex-1 p-4 pt-20 lg:p-15 lg:ml-[15%] lg:pt-0'>
                <TopBar title={'Culinaristas'} />
                <section className='
                    flex flex-col gap-10 mt-10 w-[92dvw]
                    md:gap-20 lg:w-[78vw]
                '>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <p className='font-bold text-gray-text mb-6'>CADASTRE UMA CULINARISTA</p>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome</label>
                                <Input
                                    placeholder='Nome'
                                    value={formCulinarian.nomeCulinarista}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, nomeCulinarista: e.target.value})}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>CPF</label>
                                <Input
                                    placeholder='CPF'
                                    value={formCulinarian.cpf}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, cpf: e.target.value})}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Indústria</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={formCulinarian.industria}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, industria: e.target.value})}
                                >
                                    <option value=''>Selecione a Indústria</option>
                                    {industrias.map(i => (
                                        <option key={i.id} value={i.nome}>{i.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Telefone</label>
                                <Input
                                    placeholder='Telefone'
                                    value={formCulinarian.telefone}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, telefone: e.target.value})}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Instagram</label>
                                <Input
                                    placeholder='Instagram'
                                    value={formCulinarian.instagram}
                                    onChange={e => setFormCulinarian({ ...formCulinarian, instagram: e.target.value})}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Imagem</label>
                                <Input
                                    type='file'
                                    accept='image/png, image/jpeg'
                                    onChange={(e) => {
                                        const file = e.target.files[0]
                                        if(!file) return
                                        setFormCulinarian((prev) => ({ ...prev, foto: file }))
                                    }}
                                />
                            </div>

                            <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Lojas</label>
                                <div className='flex gap-6 items-center'>
                                    <label className='flex items-center gap-2 cursor-pointer text-gray-text'>
                                        <Input
                                            type='checkbox'
                                            className='w-4 cursor-pointer'
                                            id='prado'
                                            name='Prado'
                                            value='Prado'
                                            onChange={() => handleToggleLoja('Prado')}
                                        />
                                        Prado
                                    </label>
                                    <label className='flex items-center gap-2 cursor-pointer text-gray-text'>
                                        <Input
                                            type='checkbox'
                                            className='w-4 cursor-pointer'
                                            id='teresopolis'
                                            name='teresopolis'
                                            value='Teresopolis'
                                            onChange={() => handleToggleLoja('Teresopolis')}
                                        />
                                        Teresopolis
                                    </label>
                                </div>
                            </div>

                            <div className='md:col-span-2 lg:col-span-3'>
                                <hr className='border-gray-base/30'/>
                            </div>

                            <div className='flex flex-col gap-1.5 md:col-span-2 lg:col-span-3'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Cursos que executa</label>
                                <div className='flex gap-3'>
                                    <Input
                                        placeholder='Nome do curso'
                                        value={formCulinarian.cursoAtual}
                                        onChange={e => setFormCulinarian({ ...formCulinarian, cursoAtual: e.target.value })}
                                    />
                                    <Button
                                        className='bg-orange-base text-white hover:bg-orange-light shrink-0'
                                        onClick={() => {
                                            if(!formCulinarian.cursoAtual) {
                                                alert('Preencha o campo.')
                                                return
                                            }
                                            setFormCulinarian({
                                                ...formCulinarian,
                                                cursos: [...formCulinarian.cursos, formCulinarian.cursoAtual],
                                                cursoAtual: ''
                                            })
                                        }}
                                    >
                                        <Plus />
                                    </Button>
                                </div>
                            </div>

                            {formCulinarian.cursos.length > 0 && (
                                <div className='flex flex-wrap gap-2 md:col-span-2 lg:col-span-3'>
                                    {formCulinarian.cursos.map((curso, index) => (
                                        <div key={index} className='relative flex items-center'>
                                            <p className='bg-orange-base px-3 py-1.5 text-white rounded-md text-sm'>{curso}</p>
                                            <span
                                                className='absolute -top-2 -right-2 flex items-center justify-center w-5 h-5 text-xs bg-black text-white rounded-full cursor-pointer font-bold'
                                                onClick={() => setFormCulinarian({
                                                    ...formCulinarian,
                                                    cursos: formCulinarian.cursos.filter((_, i) => i !== index)
                                                })}
                                            >
                                                <X size={10} />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className='md:col-span-2 lg:col-span-3 mt-2'>
                                <Button
                                    onClick={handleSubmitCulinarian}
                                    className='bg-orange-base text-white w-full hover:bg-orange-light'
                                >
                                    Adicionar Culinarista
                                </Button>
                            </div>

                        </div>
                    </CardDash>
                    <CardDash className='bg-white h-full w-full rounded-md p-10 shadow-sm'>
                        <p className='font-bold text-gray-text mb-4'>CULINARISTAS</p>

                        <div className='max-h-100 overflow-y-auto'>

                            {/* HEADER DESKTOP */}
                            <div className='hidden md:grid grid-cols-[1fr_1fr_0.8fr_0.7fr_0.8fr] gap-2
                                            text-xs font-semibold text-gray-text uppercase tracking-wider
                                            bg-gray px-3 py-2 rounded-md mb-1 sticky top-0 z-10'>
                                <p>NOME</p>
                                <p>INDUSTRIA</p>
                                <p>LOJAS</p>
                                <p>CADASTRO</p>
                                <p>FUNÇOES</p>
                            </div>

                            {culinaristas.length === 0 ? (
                                <div className='flex flex-col items-center gap-2 py-10 text-gray-text/40'>
                                    <Inbox size={36} />
                                    <p className='text-sm'>Nenhuma culinarista cadastrada</p>
                                </div>
                            ) : (
                                culinaristas.map(c => (
                                    <div key={c.id}>
                                        {/* MOBILE */}
                                        <div className='p-3 text-gray-text md:hidden'>
                                            <div className='flex items-center gap-2'>
                                                {c.foto
                                                    ? <img src={c.foto} className='w-8 h-8 rounded-full object-cover shrink-0' />
                                                    : <div className='w-8 h-8 rounded-full bg-gray-base/20 shrink-0' />
                                                }
                                                <p className='font-semibold'>{c.nomeCulinarista}</p>
                                            </div>
                                            <p className='text-sm text-gray-text/70 mt-0.5'>{c.industria}</p>
                                            <p className='text-sm text-gray-text/70'>Loja: {c.lojas.length > 1 ? 'Prado e Teresopolis' : c.lojas}</p>
                                            <p className='text-sm text-gray-text/70'>Cadastro: {layoutDataSistem(c.dataCadastro)}</p>
                                            <div className='flex gap-2 mt-2'>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => setConfirm({
                                        title: 'Excluir culinarista',
                                        message: `Excluir a culinarista "${c.nomeCulinarista}"?`,
                                        variant: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: () => removeCulinarian(c.id)
                                    })}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Editar'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEditCulinarian(c.id)}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Visualizar'>
                                                    <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => handleViewCulinarian(c.id)}>
                                                        <Users size={16} />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        </div>

                                        {/* DESKTOP */}
                                        <div className='hidden md:grid grid-cols-[1fr_1fr_0.8fr_0.7fr_0.8fr] gap-2
                                                        px-3 py-3 items-center text-gray-text text-sm
                                                        hover:bg-gray/60 transition-colors rounded-md'>
                                            <div className='flex items-center gap-2 min-w-0'>
                                                {c.foto
                                                    ? <img src={c.foto} className='w-7 h-7 rounded-full object-cover shrink-0' />
                                                    : <div className='w-7 h-7 rounded-full bg-gray-base/20 shrink-0' />
                                                }
                                                <p className='font-medium truncate'>{c.nomeCulinarista}</p>
                                            </div>
                                            <p className='truncate'>{c.industria}</p>
                                            <p>{c.lojas.length > 1 ? 'Prado e Teresopolis' : c.lojas}</p>
                                            <p>{layoutDataSistem(c.dataCadastro)}</p>
                                            <div className='flex gap-2'>
                                                <Tooltip label='Excluir'>
                                                    <Button className='bg-red-base p-2 hover:bg-red-light text-white' onClick={() => setConfirm({
                                        title: 'Excluir culinarista',
                                        message: `Excluir a culinarista "${c.nomeCulinarista}"?`,
                                        variant: 'danger',
                                        confirmLabel: 'Excluir',
                                        onConfirm: () => removeCulinarian(c.id)
                                    })}>
                                                        <Trash size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Editar'>
                                                    <Button className='bg-orange-base p-2 hover:bg-orange-light text-white' onClick={() => handleEditCulinarian(c.id)}>
                                                        <Edit size={16} />
                                                    </Button>
                                                </Tooltip>
                                                <Tooltip label='Visualizar'>
                                                    <Button className='bg-gray-base p-2 hover:bg-gray-dark text-white' onClick={() => handleViewCulinarian(c.id)}>
                                                        <Users size={16} />
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

                    {/* ====== MODALS ===== */}
                    <Modal
                        width='90%'
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'editCulinarian'}
                        onClose={() => closeModal()}
                    >
                        {/* HEADER */}
                        <div className='mb-6'>
                            <h2 className='text-xl font-bold text-gray-text'>Editar Culinarista</h2>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        {/* FOTO */}
                        <div className='flex items-start gap-5 mb-6 p-4 bg-gray rounded-lg'>
                            {culinarianEditar.foto === null
                                ? <div className='w-28 h-28 shrink-0 rounded-lg bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>
                                    Sem foto
                                  </div>
                                : <img
                                    src={previewImagemCulinarista ?? culinarianEditar.foto}
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

                                        setCulinarianEditar((prev) => ({
                                            ...prev,
                                            foto: file,
                                        }))

                                        const previewURL = URL.createObjectURL(file)
                                        setPreviewImagemCulinarista(previewURL)
                                    }}
                                />
                            </div>
                        </div>

                        {/* CAMPOS */}
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Nome</label>
                                <Input
                                    type='text'
                                    value={culinarianEditar.nomeCulinarista}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, nomeCulinarista: e.target.value})}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>CPF</label>
                                <Input
                                    type='text'
                                    value={culinarianEditar.cpf}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, cpf: e.target.value})}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Indústria</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={culinarianEditar.industria}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, industria: e.target.value})}
                                >
                                    <option value=''>Selecione a Indústria</option>
                                    {industrias.map(i => (
                                        <option key={i.id} value={i.nome}>{i.nome}</option>
                                    ))}
                                </select>
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Telefone</label>
                                <Input
                                    type='text'
                                    value={culinarianEditar.telefone}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, telefone: e.target.value})}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Instagram</label>
                                <Input
                                    type='text'
                                    value={culinarianEditar.instagram}
                                    onChange={e => setCulinarianEditar({ ...culinarianEditar, instagram: e.target.value})}
                                />
                            </div>
                            <div className='flex flex-col gap-1.5'>
                                <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Lojas</label>
                                <select
                                    className='p-2 border border-gray-base rounded-md text-gray-text bg-white'
                                    value={culinarianEditar.lojas?.join(',') || ''}
                                    onChange={e => setCulinarianEditar({
                                        ...culinarianEditar,
                                        lojas: e.target.value.includes(',')
                                        ? e.target.value.split(',')
                                        : [e.target.value]
                                    })}
                                >
                                    <option value=''>Selecione a loja</option>
                                    <option value='Prado'>Prado</option>
                                    <option value='Teresopolis'>Teresopolis</option>
                                    <option value='Prado,Teresopolis'>Prado e Teresopolis</option>
                                </select>
                            </div>
                        </div>

                        {/* CURSOS */}
                        <div className='mb-6'>
                            <hr className='border-gray-base/30 w-full mb-4'/>
                            <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>Cursos que executa</label>
                            <div className='flex gap-3 mt-2'>
                                <Input
                                    value={cursoAtual}
                                    onChange={e => setCursoAtual(e.target.value)}
                                    placeholder='Nome do curso'
                                />
                                <Button
                                    className='bg-orange-base hover:bg-orange-light text-white shrink-0'
                                    onClick={() => {
                                        setCulinarianEditar(prev => ({
                                            ...prev,
                                            cursos: [...prev.cursos, cursoAtual]
                                        }))
                                        setCursoAtual('')
                                    }}
                                >
                                    <Plus />
                                </Button>
                            </div>
                            <div className='flex flex-wrap gap-2 mt-3'>
                                {culinarianEditar.cursos.map((curso, index) => (
                                    <div key={index} className='relative flex items-center'>
                                        <p className='bg-orange-base px-3 py-1.5 text-white rounded-md text-sm'>{curso}</p>
                                        <Button
                                            className='absolute -top-2 -right-2 w-5 h-5 text-xs bg-black text-white rounded-full p-0 flex items-center justify-center'
                                            onClick={() => setCulinarianEditar({
                                                ...culinarianEditar,
                                                cursos: culinarianEditar.cursos.filter((_, i) => i !== index)
                                            })}
                                        >
                                            <span>X</span>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button
                            className='w-full bg-orange-base hover:bg-orange-light text-white'
                            onClick={() => setConfirm({
                                title: 'Salvar alterações',
                                message: 'Salvar as alterações desta culinarista?',
                                variant: 'neutral',
                                confirmLabel: 'Salvar',
                                onConfirm: editarCulinarian
                            })}
                        >
                            Salvar Edições
                        </Button>
                    </Modal>

                    <Modal
                        width='90%'
                        maxWidth='800px'
                        height='auto'
                        isOpen={step === 'viewCulinarian'}
                        onClose={() => closeModal()}
                    >
                        {/* HEADER */}
                        <div className='mb-6'>
                            <h2 className='text-xl font-bold text-gray-text'>Perfil da Culinarista</h2>
                            <hr className='border-gray-base/30 w-full mt-3'/>
                        </div>

                        <div className='flex items-start gap-6'>
                            {culinarianEditar.foto === null
                                ? <div className='w-24 h-24 shrink-0 rounded-full bg-gray-base/20 flex items-center justify-center text-gray-text text-xs text-center'>
                                    Sem foto
                                  </div>
                                : <img
                                    src={culinarianEditar.foto}
                                    className='w-24 h-24 shrink-0 object-cover rounded-full'
                                  />
                            }
                            <div className='flex flex-col gap-2 text-gray-text'>
                                <p><span className='font-semibold'>Nome:</span> {culinarianEditar.nomeCulinarista}</p>
                                <p><span className='font-semibold'>CPF:</span> {culinarianEditar.cpf}</p>
                                <p><span className='font-semibold'>Indústria:</span> {culinarianEditar.industria}</p>
                                <p><span className='font-semibold'>Telefone:</span> {culinarianEditar.telefone}</p>
                                <p><span className='font-semibold'>Instagram:</span> {culinarianEditar.instagram}</p>
                                <p><span className='font-semibold'>Lojas:</span> {culinarianEditar.lojas?.join(', ')}</p>
                            </div>
                        </div>

                        {culinarianEditar.cursos?.length > 0 && (
                            <div className='mt-6'>
                                <hr className='border-gray-base/30 mb-4'/>
                                <p className='text-xs font-semibold text-gray-text uppercase tracking-wider mb-3'>Cursos que executa</p>
                                <div className='flex flex-wrap gap-2'>
                                    {culinarianEditar.cursos.map((curso, i) => (
                                        <p key={i} className='bg-orange-base px-3 py-1.5 text-white rounded-md text-sm'>{curso}</p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Modal>
                    {/* ====== MODALS ===== */}

                    <ConfirmModal
                        isOpen={!!confirm}
                        title={confirm?.title || 'Confirmação'}
                        message={confirm?.message}
                        variant={confirm?.variant}
                        confirmLabel={confirm?.confirmLabel}
                        onConfirm={() => { confirm.onConfirm(); setConfirm(null); }}
                        onCancel={() => setConfirm(null)}
                    />
                </section>
            </main>
        </div>
    )
}