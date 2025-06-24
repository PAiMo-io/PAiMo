import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ConfirmLeaveDialog from '@/components/event/ConfirmLeaveDialog'

interface Props {
    canRegister: boolean
    canUnregister: boolean
    onRegister: () => void
    onUnregister: () => Promise<void>
}

export default function RegistrationControls({ canRegister, canUnregister, onRegister, onUnregister }: Props) {
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

    if (canRegister) return <Button onClick={onRegister}>Register</Button>
    if (canUnregister) return (
        <>
            <Button onClick={() => setShowLeaveConfirm(true)}>Leave</Button>
            <ConfirmLeaveDialog
                open={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={onUnregister}
            />
        </>
    )
    return null
}