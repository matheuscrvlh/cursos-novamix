import { useState, useEffect } from 'react';
import { Trash2, Pencil, UserPlus, Users, Eye, EyeOff, ShieldCheck } from 'lucide-react';

import CardDash from '../../components/admin/CardDash';
import Modal from '../../components/public/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ConfirmModal from '../../components/admin/ModalConfirm';
import AdminPage from '../../layouts/admin/AdminPage';

import { getUsuarios, postUsuario, putUsuario, deleteUsuario } from '../../api/users.services';

const formVazio = { usuario: '', senha: '', confirmarSenha: '' };

export default function UsersAdmin() {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);

    const [form, setForm] = useState(formVazio);
    const [editando, setEditando] = useState(null);
    const [step, setStep] = useState(null);
    const [erro, setErro] = useState('');
    const [salvando, setSalvando] = useState(false);

    const [showSenha, setShowSenha] = useState(false);
    const [deletarId, setDeletarId] = useState(null);

    async function carregar() {
        setLoading(true);
        try {
            const data = await getUsuarios();
            setUsuarios(Array.isArray(data) ? data : []);
        } catch {
            setUsuarios([]);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { carregar(); }, []);

    function abrirCadastro() {
        setForm(formVazio);
        setErro('');
        setShowSenha(false);
        setEditando(null);
        setStep('form');
    }

    function abrirEdicao(usuario) {
        setForm({ usuario: usuario.usuario, senha: '', confirmarSenha: '' });
        setErro('');
        setShowSenha(false);
        setEditando(usuario);
        setStep('form');
    }

    function fechar() {
        setStep(null);
        setErro('');
        setEditando(null);
    }

    async function handleSalvar() {
        setErro('');

        if (!form.usuario.trim()) {
            setErro('Nome de usuário é obrigatório.');
            return;
        }

        if (!editando && !form.senha) {
            setErro('Senha é obrigatória.');
            return;
        }

        if (form.senha && form.senha !== form.confirmarSenha) {
            setErro('As senhas não coincidem.');
            return;
        }

        if (form.senha && form.senha.length < 6) {
            setErro('A senha deve ter no mínimo 6 caracteres.');
            return;
        }

        setSalvando(true);
        try {
            const payload = { usuario: form.usuario.trim() };
            if (form.senha) payload.senha = form.senha;

            let res;
            if (editando) {
                res = await putUsuario(editando.id, payload);
            } else {
                res = await postUsuario(payload);
            }

            if (res.error) {
                setErro(res.error);
                return;
            }

            fechar();
            carregar();
        } catch {
            setErro('Erro ao salvar. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    }

    async function handleDeletar() {
        if (!deletarId) return;
        try {
            const res = await deleteUsuario(deletarId);
            if (res.error) { alert(res.error); return; }
            setDeletarId(null);
            carregar();
        } catch {
            alert('Erro ao excluir.');
        }
    }

    function formatarData(iso) {
        if (!iso) return '—';
        const d = new Date(iso);
        return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }

    return (
        <AdminPage title='Usuários'>
                <div className='flex flex-col gap-6'>

                    <CardDash className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='bg-orange-base/10 p-2.5 rounded-lg'>
                                <Users size={22} className='text-orange-base' />
                            </div>
                            <div>
                                <p className='font-bold text-gray-dark text-lg'>Usuários do Sistema</p>
                                <p className='text-gray-text text-sm'>{usuarios.length} usuário{usuarios.length !== 1 ? 's' : ''} cadastrado{usuarios.length !== 1 ? 's' : ''}</p>
                            </div>
                        </div>
                        <Button
                            onClick={abrirCadastro}
                            className='bg-orange-base text-white hover:bg-orange-light cursor-pointer flex items-center gap-2 mt-3 sm:mt-0'
                        >
                            <UserPlus size={16} />
                            Novo usuário
                        </Button>
                    </CardDash>

                    <CardDash className='overflow-x-auto'>
                        {loading ? (
                            <div className='flex justify-center items-center py-16'>
                                <p className='text-gray-text'>Carregando...</p>
                            </div>
                        ) : usuarios.length === 0 ? (
                            <div className='flex flex-col items-center justify-center py-16 gap-3'>
                                <ShieldCheck size={40} className='text-gray-text/40' />
                                <p className='text-gray-text'>Nenhum usuário cadastrado.</p>
                            </div>
                        ) : (
                            <table className='w-full text-sm'>
                                <thead>
                                    <tr className='border-b border-gray-base/30'>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-text text-xs uppercase tracking-wider'>Usuário</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-text text-xs uppercase tracking-wider hidden sm:table-cell'>Cadastro</th>
                                        <th className='text-left py-3 px-4 font-semibold text-gray-text text-xs uppercase tracking-wider hidden md:table-cell'>ID</th>
                                        <th className='py-3 px-4'></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {usuarios.map(u => (
                                        <tr key={u.id} className='border-b border-gray-base/20 hover:bg-gray-base/10 transition'>
                                            <td className='py-3 px-4'>
                                                <div className='flex items-center gap-2.5'>
                                                    <div className='w-8 h-8 rounded-full bg-orange-base/15 flex items-center justify-center shrink-0'>
                                                        <span className='text-orange-base font-bold text-xs'>
                                                            {u.usuario.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <span className='font-medium text-gray-dark'>{u.usuario}</span>
                                                </div>
                                            </td>
                                            <td className='py-3 px-4 text-gray-text hidden sm:table-cell'>{formatarData(u.dataCadastro)}</td>
                                            <td className='py-3 px-4 text-gray-text/50 text-xs hidden md:table-cell font-mono'>{u.id.split('-')[0]}…</td>
                                            <td className='py-3 px-4'>
                                                <div className='flex items-center gap-2 justify-end'>
                                                    <button
                                                        onClick={() => abrirEdicao(u)}
                                                        className='p-1.5 rounded-md hover:bg-blue-50 text-gray-text hover:text-blue-600 transition cursor-pointer'
                                                        title='Editar'
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeletarId(u.id)}
                                                        className='p-1.5 rounded-md hover:bg-red-50 text-gray-text hover:text-red-500 transition cursor-pointer'
                                                        title='Excluir'
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardDash>
                </div>

            <Modal
                isOpen={step === 'form'}
                onClose={fechar}
                width='100%'
                maxWidth='440px'
            >
                <p className='font-bold text-gray-dark text-lg mb-5'>
                    {editando ? 'Editar usuário' : 'Novo usuário'}
                </p>

                <div className='flex flex-col gap-4'>
                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>
                            Nome de usuário
                        </label>
                        <Input
                            type='text'
                            placeholder='ex: admin'
                            value={form.usuario}
                            onChange={e => setForm(p => ({ ...p, usuario: e.target.value }))}
                            className='w-full'
                        />
                    </div>

                    <div className='flex flex-col gap-1.5'>
                        <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>
                            {editando ? 'Nova senha (deixe vazio para manter)' : 'Senha'}
                        </label>
                        <div className='relative'>
                            <Input
                                type={showSenha ? 'text' : 'password'}
                                placeholder='Mínimo 6 caracteres'
                                value={form.senha}
                                onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
                                className='w-full pr-10'
                            />
                            <button
                                type='button'
                                onClick={() => setShowSenha(s => !s)}
                                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-text hover:text-gray-dark transition cursor-pointer'
                            >
                                {showSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {form.senha && (
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs font-semibold text-gray-text uppercase tracking-wider'>
                                Confirmar senha
                            </label>
                            <Input
                                type={showSenha ? 'text' : 'password'}
                                placeholder='Repita a senha'
                                value={form.confirmarSenha}
                                onChange={e => setForm(p => ({ ...p, confirmarSenha: e.target.value }))}
                                className='w-full'
                            />
                        </div>
                    )}

                    {erro && (
                        <p className='text-red-500 text-sm bg-red-50 px-3 py-2 rounded-md'>{erro}</p>
                    )}

                    <Button
                        onClick={handleSalvar}
                        disabled={salvando}
                        className='bg-orange-base text-white hover:bg-orange-light cursor-pointer w-full mt-1 disabled:opacity-60'
                    >
                        {salvando ? 'Salvando...' : (editando ? 'Salvar alterações' : 'Cadastrar usuário')}
                    </Button>
                </div>
            </Modal>

            <ConfirmModal
                isOpen={!!deletarId}
                title='Excluir usuário'
                message='Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
                variant='danger'
                confirmLabel='Excluir'
                onConfirm={handleDeletar}
                onCancel={() => setDeletarId(null)}
            />
        </AdminPage>
    );
}
