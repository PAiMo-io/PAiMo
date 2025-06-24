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
  event: any
  setEventField: (field: string, value: any) => void
  saveInfo: () => void
  removeParticipant: (id: string) => void
  generateMatches: () => void
  generateGroups: () => void
  groups?: any[] // Assuming groups is an array of some kind, adjust type as needed
}

export default function EventContent({
  status,
  isAdmin,
  participants,
  currentUserId,
  event,
  setEventField,
  saveInfo,
  removeParticipant,
  generateMatches,
  generateGroups,
  groups
}: EventContentProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'ranking' | 'umpire'>('draw')

  const form = (
    <div className="space-y-2 max-w-xs mx-auto mb-2">
      {status !== 'arranging' && (<><Input value={event.editingName} onChange={e => setEventField('editingName', e.target.value)} placeholder="name" />
        <Select value={event.editingVisibility} onValueChange={v => setEventField('editingVisibility', v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="visibility" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="private">private</SelectItem>
            <SelectItem value="public-view">public-view</SelectItem>
            <SelectItem value="public-join">public-join</SelectItem>
          </SelectContent>
        </Select>
        <Input
          value={event.editingGameStyle}
          onChange={e => setEventField('editingGameStyle', e.target.value)}
          placeholder="game style"
        />
        <Input
          type="datetime-local"
          value={event.editingRegEnd}
          onChange={e => setEventField('editingRegEnd', e.target.value)}
        />
        <Input
          value={event.editingLocation}
          onChange={e => setEventField('editingLocation', e.target.value)}
          placeholder="location"
        /></>)}
      {status === 'arranging' && (
        <>
          <Input
            value={event.editingMaxPoint}
            onChange={e => setEventField('editingMaxPoint', e.target.value)}
            placeholder="max point"
          />
          <Input
            value={event.editingCourtCount}
            onChange={e => setEventField('editingCourtCount', e.target.value)}
            placeholder="total court"
          />
        </>
      )}
      <Button onClick={saveInfo}>Save</Button>
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
          <h2 className="text-lg mb-2">Participants</h2>
          <div className="space-y-1">
            {participants.map(p => (
              <div key={p.id} className="flex items-center justify-between">
                <UserCard user={p} />
                {(isAdmin || p.id === currentUserId) && (
                  <Button variant="ghost" onClick={() => removeParticipant(p.id)}>
                    {p.id === currentUserId ? 'Leave' : 'Remove'}
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (status === 'arranging') {
    return (
      <div className="space-x-2">
        {isAdmin && form}
        {isAdmin && (
          <Button onClick={generateGroups}>Generate Groups</Button>
        )}
        {isAdmin && groups && groups.length > 0 && (
          <Button onClick={generateMatches}>Generate Match</Button>
        )}
      </div>
    )
  }

  if (status === 'running') {
    return (
      <div>
        <div className="flex space-x-2 mb-4">
          <Button
            variant={activeTab === 'draw' ? 'default' : 'outline'}
            onClick={() => setActiveTab('draw')}
          >
            Draw
          </Button>
          <Button
            variant={activeTab === 'ranking' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ranking')}
          >
            Ranking
          </Button>
          <Button
            variant={activeTab === 'umpire' ? 'default' : 'outline'}
            onClick={() => setActiveTab('umpire')}
          >
            Umpire
          </Button>
        </div>
        {activeTab === 'draw' && <div>Draw view</div>}
        {activeTab === 'ranking' && <div>Ranking view</div>}
        {activeTab === 'umpire' && <div>Umpire view</div>}
      </div>
    )
  }

  return null
}
