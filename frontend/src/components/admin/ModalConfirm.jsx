export default function ConfirmModal({
    isOpen,
    title = 'Confirmação',
    message = 'Tem certeza?',
    onConfirm,
    onCancel
}) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-[350px] shadow-lg">
                <h2 className="text-lg font-semibold mb-4">
                    {title}
                </h2>

                <p className="text-gray-600 mb-6">
                    {message}
                </p>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md border hover:bg-gray-100"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-md bg-red-light text-white hover:bg-red-base"
                    >
                        Confirmar
                    </button>
                </div>
            </div>
        </div>
    )
}
