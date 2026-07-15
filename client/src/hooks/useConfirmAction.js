import { useState } from 'react'

export default function useConfirmAction() {
    const [confirm, setConfirm] = useState(null)

    function ask(options) {
        setConfirm(options)
    }

    function handleConfirm() {
        confirm?.onConfirm()
        setConfirm(null)
    }

    function handleCancel() {
        setConfirm(null)
    }

    return { confirm, ask, handleConfirm, handleCancel }
}
