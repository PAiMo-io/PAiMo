import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ConfirmLeaveDialog from '@/components/event/ConfirmLeaveDialog'
import { useTranslation } from 'react-i18next'

interface Props {
    canRegister: boolean
    canUnregister: boolean
    onRegister: () => void
    onUnregister: () => Promise<void>
}

export default function RegistrationControls({ canRegister, canUnregister, onRegister, onUnregister }: Props) {
    const { t } = useTranslation('common')
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false)

    if (canRegister) return <Button onClick={onRegister}>{t('register')}</Button>
    if (canUnregister) return (
        <>
            <Button onClick={() => setShowLeaveConfirm(true)}>{t('leave')}</Button>
            <ConfirmLeaveDialog
                open={showLeaveConfirm}
                onClose={() => setShowLeaveConfirm(false)}
                onConfirm={onUnregister}
            />
        </>
    )
    return null
}