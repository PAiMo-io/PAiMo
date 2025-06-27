import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash } from 'lucide-react'

export interface Participant {
    id: string
    username?: string
    nickname?: string
    image?: string | null
    avatarUpdatedAt?: string | number | null // Add this line
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
    // Helper for cache-busting avatar URL
    function getAvatarUrl(image?: string | null, avatarUpdatedAt?: string | number | null) {
        if (!image) return '';
        return avatarUpdatedAt
            ? `${image}?v=${new Date(avatarUpdatedAt).getTime()}`
            : image;
    }

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
                                    src={getAvatarUrl(p.image, p.avatarUpdatedAt)}
                                    alt={p.nickname || p.username}
                                    className="h-6 w-6 rounded-full"
                                />
                            )}
                            <span>{p.nickname || p.username || 'Anonymous'}</span>
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
