'use client'

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Plus, Minus } from 'lucide-react'

interface ScoreEntryDialogProps {
    open: boolean
    matchId: string
    initialScores: [number, number]
    onClose: () => void
    handleSaveScores: (matchId: string, scores: [number, number]) => void
}

export default function ScoreEntryDialog({
    open,
    matchId,
    initialScores,
    onClose,
    handleSaveScores,
}: ScoreEntryDialogProps) {
    const [scores, setScores] = useState<[number, number]>(initialScores)
    const [saving, setSaving] = useState(false)

    // Reset when opened
    useEffect(() => {
        if (open) {
            setScores(initialScores)
            setSaving(false)
        }
    }, [open, initialScores])

    const stepScore = (teamIndex: 0 | 1, delta: number) => {
        setScores(prev => {
            const next = [...prev] as [number, number]
            const newVal = Math.max(0, next[teamIndex] + delta)
            next[teamIndex] = newVal
            return next
        })
    }

    const onConfirm = async () => {
        setSaving(true)
        try {
            await handleSaveScores(matchId, scores)
            onClose()
        } catch (err) {
            console.error('Error saving scores', err)
            // Optionally show an error UI
        } finally {
            setSaving(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record Match Score</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                    Use the buttons to adjust each team’s score. Tap Confirm when ready.
                </DialogDescription>

                <div className="flex flex-col space-y-4 mt-4">
                    {['Team A', 'Team B'].map((label, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                            <span className="font-medium">{label}</span>
                            <div className="flex items-center space-x-2">
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => stepScore(idx as 0 | 1, -1)}
                                    disabled={scores[idx] <= 0 || saving}
                                >
                                    <Minus />
                                </Button>
                                <span className="w-10 text-center text-xl font-semibold">{scores[idx]}</span>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => stepScore(idx as 0 | 1, +1)}
                                    disabled={saving}
                                >
                                    <Plus />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <DialogFooter className="mt-6 flex justify-end space-x-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={saving}>
                        {saving ? 'Saving…' : 'Confirm'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
