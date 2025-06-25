'use client'
import { useState, useEffect } from 'react'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { FloatingLabelSelect } from '@/components/ui/floating-label-select'
import { Button } from '@/components/ui/button'
import { SelectItem } from '@/components/ui/select'
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
    <div className="space-y-4 max-w-sm">
      <FloatingLabelInput
        value={name}
        onChange={e => setName(e.target.value)}
        label={t('name')}
        disabled={!isAdmin}
      />
      <FloatingLabelSelect
        id="visibility-select"
        value={visibility}
        onValueChange={setVisibility}
        disabled={!isAdmin}
        label={t('visibility')}
      >
        <SelectItem value="private">{t('private')}</SelectItem>
        <SelectItem value="public-view">{t('publicView')}</SelectItem>
        <SelectItem value="public-join">{t('publicJoin')}</SelectItem>
      </FloatingLabelSelect>
      <FloatingLabelInput
        type="datetime-local"
        value={regEnd}
        onChange={e => setRegEnd(e.target.value)}
        label={t('registrationEndTime')}
        disabled={!isAdmin}
      />
      <FloatingLabelInput
        value={location}
        onChange={e => setLocation(e.target.value)}
        label={t('locationPlace')}
        disabled={!isAdmin}
      />
      <FloatingLabelInput
        value={gameStyle}
        onChange={e => setGameStyle(e.target.value)}
        label={t('gameStyle')}
        disabled={!isAdmin}
      />
      <FloatingLabelInput
        type="number"
        value={maxPoint}
        onChange={e => setMaxPoint(e.target.value)}
        label={t('maxPoint')}
        disabled={!isAdmin}
      />
      <FloatingLabelInput
        type="number"
        value={courtCount}
        onChange={e => setCourtCount(e.target.value)}
        label={t('courtCount')}
        disabled={!isAdmin}
      />
      <FloatingLabelInput
        value={umpires}
        onChange={e => setUmpires(e.target.value)}
        label={t('umpireIds')}
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
