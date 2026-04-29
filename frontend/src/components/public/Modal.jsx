// React
import { useEffect } from "react"

export default function Modal({
    as: Component = 'div',
    width,
    maxWidth,
    height,
    className = '',
    children,
    isOpen,
    onClose,
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
            className="flex items-center justify-center fixed inset-0 w-full h-full bg-black/70 z-50 p-4"
            onClick={onClose}
        >
            <Component
                style={{
                    width,
                    height,
                    maxWidth: maxWidth || width
                }}
                className={`
                    bg-white shadow-md rounded-md p-4 md:p-6
                    max-h-[90vh] overflow-y-auto
                    relative
                    ${className}
                `}
                onClick={(e) => e.stopPropagation()}
                {...props}
            >
                <button
                    className="
                        absolute top-3 right-3
                        cursor-pointer text-xl md:text-2xl font-bold
                        text-gray-dark hover:text-orange-base
                    "
                    onClick={onClose}
                >
                    ✕
                </button>

                {children}
            </Component>
        </div>
    )
}