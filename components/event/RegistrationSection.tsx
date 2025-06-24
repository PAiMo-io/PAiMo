import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'

export interface Participant {
    id: string
    username?: string
    image?: string | null
}

interface RegistrationSectionProps {
    participants: Participant[]
    currentUserId?: string
    isAdmin: boolean
    onRemoveParticipant: (userId: string) => void
}

export default function RegistrationSection({
    participants,
    currentUserId,
    isAdmin,
    onRemoveParticipant
}: RegistrationSectionProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Participants ({participants.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {participants.map(p => (
                    <div
                        key={p.id}
                        className="flex items-center justify-between bg-gray-50 p-2 rounded"
                    >
                        <div className="flex items-center space-x-2">
                            {p.image && (
                                <img
                                    src={p.image}
                                    alt={p.username}
                                    className="h-6 w-6 rounded-full"
                                />
                            )}
                            <span>{p.username || 'Anonymous'}</span>
                        </div>
                        {isAdmin && p.id !== currentUserId && (
                            <Button
                                size="icon"
                                variant="destructive"
                                onClick={() => onRemoveParticipant(p.id)}
                            >
                                <Trash size={16} />
                            </Button>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}
