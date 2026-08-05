import { useState, useEffect, useRef } from 'react'
import { Trash, ArrowUp, ArrowDown, Plus, Link, Image, ExternalLink } from 'lucide-react'

import AdminPage from '../../layouts/admin/AdminPage'
import ConfirmModal from '../../components/admin/ModalConfirm'
import useConfirmAction from '../../hooks/useConfirmAction'
import { getBanners, postBanner, putBanner, deleteBanner } from '../../api/banners.services'

function UploadArea({ label, hint, aspectClass, preview, inputRef, onChange }) {
    return (
        <div className='flex flex-col gap-1.5'>
            <div className='flex items-baseline gap-2'>
                <p className='text-xs font-semibold text-gray-text/60 uppercase tracking-wide'>{label}</p>
                <p className='text-[11px] text-gray-text/35'>{hint}</p>
            </div>
            <div
                className={`relative w-full ${aspectClass} rounded-lg overflow-hidden bg-gray-base/10 flex items-center justify-center cursor-pointer border-2 border-dashed border-gray-base/20 hover:border-orange-base transition-colors`}
                onClick={() => inputRef.current.click()}
            >
                {preview
                    ? <img src={preview} alt='' className='w-full h-full object-cover' />
                    : <div className='flex flex-col items-center gap-1.5 text-gray-base/40 px-3 text-center'>
                        <Image size={24} />
                        <p className='text-xs leading-snug'>Clique para selecionar</p>
                    </div>
                }
                <input ref={inputRef} type='file' accept='image/*' className='hidden' onChange={onChange} />
            </div>
        </div>
    )
}

function BannerForm({ posicao, onAdded }) {
    const [imagemDesktop, setImagemDesktop]   = useState(null)
    const [previewDesktop, setPreviewDesktop] = useState(null)
    const [imagemMobile, setImagemMobile]     = useState(null)
    const [previewMobile, setPreviewMobile]   = useState(null)
    const [link, setLink]                     = useState('')
    const [loading, setLoading]               = useState(false)
    const inputDesktopRef                     = useRef()
    const inputMobileRef                      = useRef()

    function handleFile(e, type) {
        const file = e.target.files[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        if (type === 'desktop') { setImagemDesktop(file); setPreviewDesktop(url) }
        else                    { setImagemMobile(file);  setPreviewMobile(url)  }
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!imagemDesktop) return
        setLoading(true)
        try {
            const fd = new FormData()
            fd.append('posicao', posicao)
            fd.append('imagem', imagemDesktop)
            if (imagemMobile) fd.append('imagem_mobile', imagemMobile)
            fd.append('link', link)
            fd.append('ordem', 0)

            const novo = await postBanner(fd)
            onAdded(novo)
            setImagemDesktop(null); setPreviewDesktop(null)
            setImagemMobile(null);  setPreviewMobile(null)
            setLink('')
            inputDesktopRef.current.value = ''
            inputMobileRef.current.value  = ''
        } catch {
            alert('Erro ao adicionar banner.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className='border border-dashed border-gray-base/30 rounded-xl p-5 flex flex-col gap-4 bg-gray/40'>
            <p className='text-sm font-semibold text-gray-text/60 uppercase tracking-wider'>Adicionar banner</p>

            <div className='grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-4 items-start'>
                <UploadArea
                    label='Desktop'
                    hint='1920 × 480 px'
                    aspectClass='aspect-4/1 min-h-16'
                    preview={previewDesktop}
                    inputRef={inputDesktopRef}
                    onChange={e => handleFile(e, 'desktop')}
                />
                <UploadArea
                    label='Mobile'
                    hint='425 × 495 px (opcional)'
                    aspectClass='aspect-[425/495] w-full sm:w-28'
                    preview={previewMobile}
                    inputRef={inputMobileRef}
                    onChange={e => handleFile(e, 'mobile')}
                />
            </div>

            <div className='flex items-center gap-2 bg-white border border-gray-base/25 rounded-lg px-3 py-2'>
                <Link size={15} className='text-gray-base/50 shrink-0' />
                <input
                    type='url'
                    placeholder='URL de redirecionamento (opcional)'
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    className='flex-1 text-sm text-gray-text outline-none bg-transparent'
                />
            </div>

            <button
                type='submit'
                disabled={!imagemDesktop || loading}
                className='flex items-center justify-center gap-2 bg-orange-base text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-orange-light transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'
            >
                <Plus size={16} />
                {loading ? 'Enviando...' : 'Adicionar banner'}
            </button>
        </form>
    )
}

function BannerItem({ banner, onDelete, onMoveUp, onMoveDown, isFirst, isLast }) {
    const [link, setLink]         = useState(banner.link || '')
    const [editingLink, setEditingLink] = useState(false)
    const [saving, setSaving]     = useState(false)

    async function saveLink() {
        setSaving(true)
        try {
            await putBanner(banner.id, { link })
        } finally {
            setSaving(false)
            setEditingLink(false)
        }
    }

    return (
        <div className='flex gap-3 items-center bg-white border border-gray-base/15 rounded-xl p-3 shadow-sm'>

            <div className='flex gap-2 shrink-0'>
                <div className='flex flex-col gap-1'>
                    <p className='text-[10px] text-gray-text/30 uppercase text-center'>Desktop</p>
                    <div className='w-24 h-6 rounded overflow-hidden bg-gray-base/10'>
                        <img src={banner.imagem} alt='' className='w-full h-full object-cover' />
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-[10px] text-gray-text/30 uppercase text-center'>Mobile</p>
                    <div className='w-8 h-9 rounded overflow-hidden bg-gray-base/10 flex items-center justify-center'>
                        {banner.imagem_mobile
                            ? <img src={banner.imagem_mobile} alt='' className='w-full h-full object-cover' />
                            : <span className='text-gray-base/25 text-xs'>—</span>
                        }
                    </div>
                </div>
            </div>

            <div className='flex-1 min-w-0'>
                <p className='text-xs text-gray-text/40 uppercase tracking-wider mb-1'>Link</p>
                {editingLink ? (
                    <div className='flex gap-2 items-center'>
                        <input
                            type='url'
                            value={link}
                            onChange={e => setLink(e.target.value)}
                            className='flex-1 text-xs border border-gray-base/30 rounded-md px-2 py-1 outline-none focus:border-orange-base'
                            autoFocus
                            placeholder='https://...'
                        />
                        <button
                            onClick={saveLink}
                            disabled={saving}
                            className='text-xs bg-orange-base text-white px-2 py-1 rounded-md hover:bg-orange-light transition cursor-pointer'
                        >
                            {saving ? '...' : 'Salvar'}
                        </button>
                        <button
                            onClick={() => { setLink(banner.link || ''); setEditingLink(false) }}
                            className='text-xs text-gray-text/50 hover:text-gray-text transition cursor-pointer'
                        >
                            Cancelar
                        </button>
                    </div>
                ) : (
                    <div
                        className='flex items-center gap-1.5 cursor-pointer group'
                        onClick={() => setEditingLink(true)}
                    >
                        <ExternalLink size={12} className='text-gray-base/40 shrink-0' />
                        <p className='text-xs text-gray-text/60 truncate group-hover:text-orange-base transition'>
                            {link || <span className='italic text-gray-text/30'>Sem link — clique para adicionar</span>}
                        </p>
                    </div>
                )}
            </div>

            <div className='flex flex-col gap-1 shrink-0'>
                <button
                    onClick={onMoveUp}
                    disabled={isFirst}
                    className='w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray transition disabled:opacity-25 cursor-pointer disabled:cursor-default'
                >
                    <ArrowUp size={14} className='text-gray-text' />
                </button>
                <button
                    onClick={onMoveDown}
                    disabled={isLast}
                    className='w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray transition disabled:opacity-25 cursor-pointer disabled:cursor-default'
                >
                    <ArrowDown size={14} className='text-gray-text' />
                </button>
            </div>

            <button
                onClick={onDelete}
                className='w-8 h-8 flex items-center justify-center rounded-lg bg-red-base/10 hover:bg-red-base text-red-base hover:text-white transition cursor-pointer shrink-0'
            >
                <Trash size={15} />
            </button>
        </div>
    )
}

function BannerSection({ posicao, title, description }) {
    const [banners, setBanners] = useState([])
    const [loading, setLoading] = useState(true)
    const { confirm, ask, handleConfirm, handleCancel } = useConfirmAction()

    useEffect(() => {
        getBanners(posicao)
            .then(setBanners)
            .finally(() => setLoading(false))
    }, [posicao])

    function handleAdded(novo) {
        setBanners(prev => [...prev, { ...novo, ordem: prev.length }])
    }

    async function handleDelete(id) {
        try {
            await deleteBanner(id)
            setBanners(prev => prev.filter(b => b.id !== id))
        } catch {
            alert('Erro ao excluir banner.')
        }
    }

    function confirmarExclusao(id) {
        ask({
            title: 'Excluir banner',
            message: 'Excluir este banner? Essa ação não pode ser desfeita.',
            variant: 'danger',
            confirmLabel: 'Excluir',
            onConfirm: () => handleDelete(id)
        })
    }

    async function move(index, direction) {
        const anterior = banners
        const next = [...banners]
        const target = index + direction
        if (target < 0 || target >= next.length) return

        ;[next[index], next[target]] = [next[target], next[index]]

        const updated = next.map((b, i) => ({ ...b, ordem: i }))
        setBanners(updated)
        try {
            await Promise.all([
                putBanner(updated[index].id,  { ordem: updated[index].ordem }),
                putBanner(updated[target].id, { ordem: updated[target].ordem }),
            ])
        } catch {
            setBanners(anterior)
            alert('Erro ao reordenar banners.')
        }
    }

    return (
        <div className='bg-white rounded-xl shadow-sm p-5 md:p-8 flex flex-col gap-6'>
            <div>
                <h2 className='font-bold text-gray-text text-lg'>{title}</h2>
                <p className='text-sm text-gray-text/50 mt-0.5'>{description}</p>
            </div>

            <hr className='border-gray-base/20' />

            <div className='flex flex-col gap-3'>
                {loading ? (
                    <p className='text-sm text-gray-text/40 text-center py-6'>Carregando...</p>
                ) : banners.length === 0 ? (
                    <p className='text-sm text-gray-text/40 text-center py-6 italic'>Nenhum banner cadastrado</p>
                ) : (
                    banners.map((b, i) => (
                        <BannerItem
                            key={b.id}
                            banner={b}
                            isFirst={i === 0}
                            isLast={i === banners.length - 1}
                            onDelete={() => confirmarExclusao(b.id)}
                            onMoveUp={() => move(i, -1)}
                            onMoveDown={() => move(i, 1)}
                        />
                    ))
                )}
            </div>

            <BannerForm posicao={posicao} onAdded={handleAdded} />

            <ConfirmModal
                isOpen={!!confirm}
                title={confirm?.title || 'Confirmação'}
                message={confirm?.message}
                variant={confirm?.variant}
                confirmLabel={confirm?.confirmLabel}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </div>
    )
}

export default function MarketingAdmin() {
    return (
        <AdminPage title='Marketing'>
            <BannerSection
                posicao='hero'
                title='Banner Principal'
                description='Aparece no topo de todas as páginas como carrossel. A ordem define a sequência de exibição.'
            />

            <BannerSection
                posicao='home'
                title='Banner Home'
                description='Aparece na seção de Culinaristas da página inicial. Apenas o primeiro banner ativo é exibido.'
            />
        </AdminPage>
    )
}
