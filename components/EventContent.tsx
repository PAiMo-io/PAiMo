'use client'
import { useState } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './ui/select'
import UserCard from './UserCard'
import { EventStep } from './StepIndicator'
import { useTranslation } from 'react-i18next'

interface Participant {
  id: string
  username: string
  image?: string | null
}

interface EventContentProps {
  status: EventStep
  isAdmin: boolean
  participants: Participant[]
  currentUserId?: string
  editingName: string
  setEditingName: (v: string) => void
  editingVisibility: string
  setEditingVisibility: (v: string) => void
  editingGameStyle: string
  setEditingGameStyle: (v: string) => void
  editingRegEnd: string
  setEditingRegEnd: (v: string) => void
  editingLocation: string
  setEditingLocation: (v: string) => void
  editingMaxPoint: string
  setEditingMaxPoint: (v: string) => void
  editingCourtCount: string
  setEditingCourtCount: (v: string) => void
  saveInfo: () => void
  removeParticipant: (id: string) => void
  generateMatches: () => void
}

export default function EventContent({
  status,
  isAdmin,
  participants,
  currentUserId,
  editingName,
  setEditingName,
  editingVisibility,
  setEditingVisibility,
  editingGameStyle,
  setEditingGameStyle,
  editingRegEnd,
  setEditingRegEnd,
  editingLocation,
  setEditingLocation,
  editingMaxPoint,
  setEditingMaxPoint,
  editingCourtCount,
  setEditingCourtCount,
  saveInfo,
  removeParticipant,
  generateMatches,
}: EventContentProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'ranking' | 'umpire'>('draw')
  const { t } = useTranslation('common')
  const form = (
    <div className="space-y-2 max-w-xs mx-auto">
      <Input value={editingName} onChange={e => setEditingName(e.target.value)} placeholder="name" />
      <Select value={editingVisibility} onValueChange={setEditingVisibility}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t('visibility')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="private">{t('private')}</SelectItem>
          <SelectItem value="public-view">{t('publicView')}</SelectItem>
          <SelectItem value="public-join">{t('publicJoin')}</SelectItem>
        </SelectContent>
      </Select>
      <Input
        value={editingGameStyle}
        onChange={e => setEditingGameStyle(e.target.value)}
        placeholder={t('gameStyle')}
      />
      <Input
        type="datetime-local"
        value={editingRegEnd}
        onChange={e => setEditingRegEnd(e.target.value)}
      />
      <Input
        value={editingLocation}
        onChange={e => setEditingLocation(e.target.value)}
        placeholder={t('locationPlace')}
      />
      {status === 'arranging-matches' && (
        <>
          <Input
            value={editingMaxPoint}
            onChange={e => setEditingMaxPoint(e.target.value)}
            placeholder={t('maxPoint')}
          />
          <Input
            value={editingCourtCount}
            onChange={e => setEditingCourtCount(e.target.value)}
            placeholder={t('totalCourt')}
          />
        </>
      )}
      <Button onClick={saveInfo}>{t('save')}</Button>
    </div>
  )

  if (status === 'preparing') {
    return isAdmin ? form : null
  }

  if (status === 'registration') {
    return (
      <div className="space-y-4">
        {isAdmin && form}
        <div>
          <h2 className="text-lg mb-2">{t('participants')}</h2>
          <div className="space-y-1">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <UserCard user={p} />
                {(isAdmin || p.id === currentUserId) && (
                  <Button variant="ghost" onClick={() => removeParticipant(p.id)}>
                    {p.id === currentUserId ? t('leave') : t('remove')}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'arranging-matches') {
    return (
      <div className="space-y-4">
        {isAdmin && form}
        {isAdmin && (
          <Button onClick={generateMatches}>{t('refreshMatches')}</Button>
        )}
      </div>
    )
  }

  if (status === 'match-running') {
    return (
      <div>
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === 'draw' ? 'default' : 'outline'}
            onClick={() => setActiveTab('draw')}
          >
            {t('draw')}
          </Button>
          <Button
            variant={activeTab === 'ranking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ranking')}
          >
            {t('ranking')}
          </Button>
          <Button
            variant={activeTab === 'umpire' ? 'default' : 'outline'}
            onClick={() => setActiveTab('umpire')}
          >
            {t('umpire')}
          </Button>
        </div>
        {activeTab === 'draw' && <div>{t('drawView')}</div>}
        {activeTab === 'ranking' && <div>{t('rankingView')}</div>}
        {activeTab === 'umpire' && <div>{t('umpireView')}</div>}
      </div>
    )
  }

  return null
}
