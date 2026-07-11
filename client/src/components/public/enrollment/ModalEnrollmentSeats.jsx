// React
import { useEffect, useState } from "react"

// Icons
import { X } from "lucide-react"

// Components
import Button from "../../Button"

export default function ModalEnrollmentSeats({
    isOpen,
    onClick,
    onClose,
    enrollment,
    setEnrollment,
    assentos,
    assentoAtual,
    erro,
    ...props
}) {
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
            setSubmitted(false)
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    if (!isOpen) return null

    function handleConfirm() {
        setSubmitted(true);
        if (!enrollment.assento) return;
        onClick();
    }

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-xl rounded-xl w-[90%] max-w-115 max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                {/* HEADER */}
                <div className='flex items-center justify-between p-5 pb-4 border-b border-gray-base/20'>
                    <div>
                        <h2 className='font-bold text-gray-dark text-lg'>Escolha seu assento</h2>
                        <p className='text-xs text-gray-text/60 mt-0.5'>Toque no assento para selecioná-lo</p>
                    </div>
                    <button
                        className='w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray text-gray-text/60 hover:text-gray-dark transition cursor-pointer'
                        onClick={onClose}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className='p-5 flex flex-col gap-5'>

                    {/* Balcão */}
                    <div className='bg-gray-dark rounded-lg py-3 text-center text-sm font-bold text-white uppercase tracking-widest'>
                        Balcão
                    </div>

                    {/* Grid de assentos */}
                    <div className='grid grid-cols-6 gap-3'>
                        {assentos.map(assento => {
                            const isMeuAtual = assentoAtual != null && assento.id === assentoAtual;
                            const isReservado = assento.status === 'reservado' && !isMeuAtual;
                            const isSelecionado = enrollment.assento === assento.id;

                            return (
                                <button
                                    key={assento.id}
                                    disabled={isReservado}
                                    onClick={() => {
                                        if (isReservado) return;
                                        setEnrollment(prev => ({ ...prev, assento: assento.id }));
                                    }}
                                    className={`flex flex-col items-center transition-transform ${
                                        isReservado ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'
                                    }`}
                                >
                                    {/* Encosto */}
                                    <div className={`w-3/5 h-3 rounded-t-md transition-colors ${
                                        isReservado
                                            ? 'bg-gray-base/25'
                                            : isSelecionado
                                                ? 'bg-gray-dark'
                                                : isMeuAtual
                                                    ? 'bg-blue-base'
                                                    : 'bg-orange-base'
                                    }`} />
                                    {/* Assento */}
                                    <div className={`w-full h-8 rounded-b-lg flex items-center justify-center font-bold text-xs transition-colors ${
                                        isReservado
                                            ? 'bg-gray-base/20 text-gray-base/40'
                                            : isSelecionado
                                                ? 'bg-gray-dark text-white shadow-md'
                                                : isMeuAtual
                                                    ? 'bg-blue-base text-white shadow-md'
                                                    : 'bg-orange-base text-white hover:bg-orange-light'
                                    }`}>
                                        {assento.id}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Legenda */}
                    <div className='flex flex-wrap justify-center gap-x-5 gap-y-1.5'>
                        <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                            <span className='w-3 h-3 rounded-sm bg-orange-base' />
                            Disponível
                        </div>
                        <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                            <span className='w-3 h-3 rounded-sm bg-gray-dark' />
                            Selecionado
                        </div>
                        {assentoAtual != null && (
                            <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                                <span className='w-3 h-3 rounded-sm bg-blue-base' />
                                Seu assento atual
                            </div>
                        )}
                        <div className='flex items-center gap-1.5 text-xs text-gray-text/60'>
                            <span className='w-3 h-3 rounded-sm bg-gray-base/20' />
                            Ocupado
                        </div>
                    </div>

                    {erro && (
                        <p className='text-red-base text-xs text-center'>{erro}</p>
                    )}

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white font-semibold'
                        onClick={handleConfirm}
                    >
                        Confirmar assento
                    </Button>
                    {submitted && !enrollment.assento && (
                        <p className='text-red-base text-xs text-center'>Selecione um assento para continuar</p>
                    )}

                </div>
            </div>
        </div>
    )
}
