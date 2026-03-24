// REACT
import { useEffect } from "react"

// ICONS
import { X } from 'lucide-react'

// COMPONENTS
import Text from "../Text"

export default function ModalFilters({children, nameModal, onClose, isOpen}) {

    useEffect(() => {
        if(isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'auto'
        }    
        return () => {
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <Text as='div' className={`
            fixed flex justify-end bg-black/70 top-0 w-dvw h-dvh z-50
            transition-opacity duration-300
            ${isOpen ? 'opacity-100' : 'opacity-0'}
        `}>
            <Text as='div' className={`
                bg-white w-[90dvw] h-full p-5
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <X 
                    className='ml-auto cursor-pointer hover:scale-105'
                    onClick={onClose}
                />
                <Text as='p' className='text-gray-dark text-3xl font-bold text-center'>{nameModal}</Text>
                {children}
            </Text>
        </Text>
    )
}