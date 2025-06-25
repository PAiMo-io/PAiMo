'use client'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { useTranslation } from 'react-i18next'

interface Props {
  event: any
  isAdmin: boolean
  onSave: (data: {
    name: string
    visibility: string
    registrationEndTime?: string
    location?: string
    gameStyle?: string
    maxPoint?: number
    courtCount?: number
    umpires?: string[]
  }) => void
}

export default function EventInfoForm({ event, isAdmin, onSave }: Props) {
  const { t } = useTranslation('common')
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState('private')
  const [regEnd, setRegEnd] = useState('')
  const [location, setLocation] = useState('')
  const [gameStyle, setGameStyle] = useState('')
  const [maxPoint, setMaxPoint] = useState('')
  const [courtCount, setCourtCount] = useState('')
  const [umpires, setUmpires] = useState('')

  useEffect(() => {
    if (!event) return
    setName(event.name || '')
    setVisibility(event.visibility || 'private')
    setRegEnd(event.registrationEndTime ? event.registrationEndTime.slice(0, 16) : '')
    setLocation(event.location || '')
    setGameStyle(event.gameStyle || '')
    setMaxPoint(event.maxPoint != null ? String(event.maxPoint) : '')
    setCourtCount(event.courtCount != null ? String(event.courtCount) : '')
    setUmpires(event.umpires ? event.umpires.join(',') : '')
  }, [event])

  const handleSave = () => {
    onSave({
      name,
      visibility,
      registrationEndTime: regEnd || undefined,
      location,
      gameStyle,
      maxPoint: maxPoint ? Number(maxPoint) : undefined,
      courtCount: courtCount ? Number(courtCount) : undefined,
      umpires: umpires
        .split(',')
        .map(u => u.trim())
        .filter(u => u.length > 0),
    })
  }

  return (
    <div className="space-y-2 max-w-sm">
      <Input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder={t('name')}
        disabled={!isAdmin}
      />
      <Select value={visibility} onValueChange={setVisibility} disabled={!isAdmin}>
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
        type="datetime-local"
        value={regEnd}
        onChange={e => setRegEnd(e.target.value)}
        disabled={!isAdmin}
      />
      <Input
        value={location}
        onChange={e => setLocation(e.target.value)}
        placeholder={t('locationPlace')}
        disabled={!isAdmin}
      />
      <Input
        value={gameStyle}
        onChange={e => setGameStyle(e.target.value)}
        placeholder={t('gameStyle')}
        disabled={!isAdmin}
      />
      <Input
        type="number"
        value={maxPoint}
        onChange={e => setMaxPoint(e.target.value)}
        placeholder={t('maxPoint')}
        disabled={!isAdmin}
      />
      <Input
        type="number"
        value={courtCount}
        onChange={e => setCourtCount(e.target.value)}
        placeholder={t('courtCount')}
        disabled={!isAdmin}
      />
      <Input
        value={umpires}
        onChange={e => setUmpires(e.target.value)}
        placeholder={t('umpireIds')}
        disabled={!isAdmin}
      />
      {isAdmin && (
        <Button onClick={handleSave} className="w-full">
          {t('save')}
        </Button>
      )}
    </div>
  )
}
