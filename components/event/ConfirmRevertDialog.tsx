'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'

interface ConfirmRevertDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
}

export default function ConfirmRevertDialog({ open, onClose, onConfirm }: ConfirmRevertDialogProps) {
    const [countdown, setCountdown] = useState(5)
    const { t } = useTranslation('common')
    // Reset countdown when dialog opens
    useEffect(() => {
        if (open) setCountdown(5)
    }, [open])

    // Tick countdown
    useEffect(() => {
        if (!open || countdown <= 0) return
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
        return () => clearTimeout(timer)
    }, [open, countdown])

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('revertToRegistration')}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    {t('revertToRegistrationDescription')}
                </DialogDescription>
                <p className="mt-4 text-center">
                    {t('confirmIn', { countdown })} {countdown !== 1 && 's'}
                </p>
                <DialogFooter className="flex-col justify-center gap-2">
                    <Button variant="outline" onClick={onClose}>{t('cancel')}</Button>
                    <Button
                        variant="destructive"
                        disabled={countdown > 0}
                        onClick={async () => {
                            await onConfirm()
                            onClose()
                        }}
                    >
                        {t('confirm')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
