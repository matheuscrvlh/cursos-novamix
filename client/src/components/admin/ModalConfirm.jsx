import { AlertTriangle, HelpCircle } from 'lucide-react'

const VARIANTS = {
    danger: {
        icon: AlertTriangle,
        iconWrap: 'bg-red-base/10 text-red-base',
        confirmBtn: 'bg-red-base hover:bg-red-light',
    },
    warning: {
        icon: AlertTriangle,
        iconWrap: 'bg-orange-base/10 text-orange-base',
        confirmBtn: 'bg-orange-base hover:bg-orange-light',
    },
    neutral: {
        icon: HelpCircle,
        iconWrap: 'bg-blue-base/10 text-blue-base',
        confirmBtn: 'bg-blue-base hover:bg-blue-base/80',
    },
}

export default function ConfirmModal({
    isOpen,
    title = 'Confirmação',
    message = 'Tem certeza?',
    variant = 'neutral',
    icon: IconOverride,
    confirmLabel = 'Confirmar',
    cancelLabel = 'Cancelar',
    onConfirm,
    onCancel
}) {
    if (!isOpen) return null

    const preset = VARIANTS[variant] || VARIANTS.neutral
    const Icon = IconOverride || preset.icon

    return (
        <div
            className='fixed inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center z-50 p-4'
            onClick={onCancel}
        >
            <div
                className='bg-white rounded-xl w-full max-w-sm shadow-xl overflow-hidden'
                onClick={e => e.stopPropagation()}
            >
                <div className='p-6 flex flex-col items-center text-center gap-3'>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${preset.iconWrap}`}>
                        <Icon size={24} />
                    </div>
                    <h2 className='text-base font-bold text-gray-dark'>
                        {title}
                    </h2>
                    <p className='text-sm text-gray-text/70 leading-relaxed'>
                        {message}
                    </p>
                </div>

                <div className='flex border-t border-gray-base/20'>
                    <button
                        onClick={onCancel}
                        className='flex-1 py-3.5 text-sm font-semibold text-gray-text hover:bg-gray transition-colors cursor-pointer'
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3.5 text-sm font-semibold text-white transition-colors cursor-pointer ${preset.confirmBtn}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    )
}
