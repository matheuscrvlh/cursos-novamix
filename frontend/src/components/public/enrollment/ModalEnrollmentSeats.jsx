import { useEffect } from "react"
import Button from "../../Button"

export default function ModalEnrollmentSeats({
    isOpen,
    onClick,
    onClose,
    enrollment,
    setEnrollment,
    assentos,
    ...props
}) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }

        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    if (!isOpen) return null

    return (
        <div
            className='flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4'
            onClick={onClose}
        >
            <div
                className='bg-white shadow-md rounded-md p-4 md:p-6 w-[90%] max-w-[500px] h-auto max-h-[90vh] overflow-y-auto'
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <button
                    className='cursor-pointer text-xl md:text-2xl font-bold text-gray-dark hover:text-orange-base float-right mb-2'
                    onClick={onClose}
                    aria-label="Fechar modal"
                >
                    ✕
                </button>

                <div className="clear-both" />

                <div className='flex flex-col gap-3 h-full'>
                    <p className='font-semibold text-center text-lg md:text-xl mt-auto'>
                        Escolha seu assento para assistir ao curso
                    </p>

                    <div className='bg-gray-base rounded-sm p-4 md:p-6 text-center text-white font-semibold mb-6 md:mb-10'>
                        Balcão
                    </div>

                    {/* Grid de assentos */}
                    <div className='grid grid-cols-6 gap-2'>
                        {assentos.map(assento => {
                            const isReservado = assento.status === 'reservado'
                            const isSelecionado = enrollment.assento === assento.id

                            return (
                                <button
                                    key={assento.id}
                                    disabled={isReservado}
                                    className={`p-2 rounded-full text-center font-semibold text-white text-sm
                                        ${isReservado
                                            ? 'bg-gray-base cursor-not-allowed'
                                            : isSelecionado
                                                ? 'bg-gray-dark'
                                                : 'bg-orange-base hover:bg-orange-light'
                                        }
                                    `}
                                    onClick={() => {
                                        if (isReservado) return

                                        setEnrollment(prev => ({
                                            ...prev,
                                            assento: assento.id
                                        }))
                                    }}
                                >
                                    {assento.id}
                                </button>
                            )
                        })}
                    </div>

                    <Button
                        className='bg-orange-base hover:bg-orange-light text-white mt-5 mb-5'
                        onClick={onClick}
                        disabled={!enrollment.assento}
                    >
                        Enviar
                    </Button>
                </div>
            </div>
        </div>
    )
}