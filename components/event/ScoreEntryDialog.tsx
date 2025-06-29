'use client'

import React, { useState, useEffect } from 'react'
import Pusher from 'pusher-js'
import axios from 'axios'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import Image from 'next/image'
import Avatar from 'boring-avatars'

interface Player {
    _id?: string
    id?: string
    username?: string
    nickname?: string
    email?: string
    image?: string | null
}

interface Team {
    players: Player[]
    score: number
}

interface ScoreEntryDialogProps {
    open: boolean
    eventId: string
    matchId: string
    initialScores: [number, number]
    userId?: string
    teams?: [Team, Team]
    onClose: () => void
    handleSaveScores: (matchId: string, scores: [number, number]) => void
}

export default function ScoreEntryDialog({
    open,
    eventId,
    matchId,
    initialScores,
    userId,
    teams,
    onClose,
    handleSaveScores,
}: ScoreEntryDialogProps) {
    const [scores, setScores] = useState<[number, number]>(initialScores)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY
        const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
        if (!key || !cluster) return

        const pusher = new Pusher(key, { cluster })
        const channel = pusher.subscribe(`score-entry-${eventId}`)

        const handler = (data: { matchId: string; scores: [number, number]; senderId: string }) => {
            if (data.senderId === userId) return
            if (data.matchId === matchId) {
                setScores(data.scores)
            }
        }

        channel.bind('update', handler)
        return () => {
            channel.unbind('update', handler)
            pusher.disconnect()
        }
    }, [eventId, matchId, userId])

    // Reset when opened
    useEffect(() => {
        if (open) {
            setScores(initialScores)
            setSaving(false)
        }
    }, [open, initialScores])

    const updateScore = (teamIndex: 0 | 1, newScore: number) => {
        setScores(prev => {
            const next = [...prev] as [number, number]
            next[teamIndex] = newScore
            // send to API for real-time sync
            if (userId) {
                axios.post(`/api/events/${eventId}/score-sync`, {
                    matchId,
                    scores: next,
                    senderId: userId,
                }).catch(err => {
                    console.error('score sync failed', err)
                })
            }
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
                    {[0, 1].map((teamIndex) => {
                        const team = teams?.[teamIndex]

                        return (
                            <div key={teamIndex} className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 flex-1">
                                    {team?.players ? (
                                        team.players.map((player, playerIndex) => {
                                            const displayName = player.nickname || player.username || player.email || 'Unknown'
                                            return (
                                                <div key={playerIndex} className="flex-shrink-0">
                                                    {player.image ? (
                                                        <Image
                                                            src={player.image}
                                                            alt={displayName}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <Avatar size={32} name={displayName} variant="beam" />
                                                    )}
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <span className="font-medium text-sm text-gray-500">
                                            Team {teamIndex === 0 ? 'A' : 'B'}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center ml-4">
                                    <Select
                                        value={scores[teamIndex].toString()}
                                        onValueChange={(value) => updateScore(teamIndex as 0 | 1, parseInt(value))}
                                        disabled={saving}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Array.from({ length: 51 }, (_, i) => (
                                                <SelectItem key={i} value={i.toString()}>
                                                    {i}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )
                    })}
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
