'use client'
import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { FloatingLabelSelect } from '@/components/ui/floating-label-select'
import { SelectItem } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { useTranslation } from 'react-i18next'
import { GameStyle } from '@/types/gameStyle'

interface FormData {
  name: string
  visibility: string
  registrationEndTime?: string
  playDate?: string
  gymInfo?: string
  gameStyle?: string
  maxPoint?: number
  courtCount?: number
}

interface Props {
  event: any
  isAdmin: boolean
  onSave: (data: FormData) => void
}

export default function EventInfoForm({ event, isAdmin, onSave }: Props) {
  const { t } = useTranslation('common')
  const [isSaving, setIsSaving] = useState(false)
  
  const { control, reset, getValues, formState: { isDirty } } = useForm<FormData>({
    defaultValues: {
      name: '',
      visibility: 'private',
      registrationEndTime: '',
      playDate: '',
      gymInfo: '',
      gameStyle: '',
      maxPoint: undefined,
      courtCount: undefined,
    }
  })

  // Reset form when event changes
  useEffect(() => {
    if (!event || !event.id) return
    
    const formData = {
      name: event.name || '',
      visibility: event.visibility || 'private',
      registrationEndTime: event.registrationEndTime ? event.registrationEndTime.slice(0, 16) : '',
      playDate: event.playDate ? event.playDate.slice(0, 16) : '',
      gymInfo: event.gymInfo || '',
      gameStyle: event.gameStyle || '',
      maxPoint: event.maxPoint || undefined,
      courtCount: event.courtCount || undefined,
    }
    
    // Use setTimeout to ensure the reset happens after navigation
    const timeoutId = setTimeout(() => {
      reset(formData)
    }, 0)
    
    return () => clearTimeout(timeoutId)
  }, [event, reset])

  // Don't render the form if event data is not yet loaded
  if (!event || !event.id) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Handle save button click
  const handleSave = async () => {
    if (!isAdmin) return
    
    setIsSaving(true)
    try {
      const currentData = getValues()
      await onSave({
        ...currentData,
        registrationEndTime: currentData.registrationEndTime || undefined,
        playDate: currentData.playDate || undefined,
      })
    } catch (error) {
      console.error('Failed to save form data:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-4 mt-5 max-w-sm">
      <form className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            label={t('name')}
            disabled={!isAdmin}
          />
        )}
      />
      
      <Controller
        name="visibility"
        control={control}
        render={({ field }) => (
          <FloatingLabelSelect
            id="visibility-select"
            value={field.value}
            onValueChange={field.onChange}
            disabled={!isAdmin}
            label={t('visibility')}
          >
            <SelectItem value="private">{t('private')}</SelectItem>
            <SelectItem value="public-view">{t('publicView')}</SelectItem>
            <SelectItem value="public-join">{t('publicJoin')}</SelectItem>
          </FloatingLabelSelect>
        )}
      />
      
      <Controller
        name="registrationEndTime"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            type="datetime-local"
            label={t('registrationEndTime')}
            disabled={!isAdmin}
          />
        )}
      />
      
      <Controller
        name="playDate"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            type="datetime-local"
            label={t('eventPlayDate')}
            disabled={!isAdmin}
          />
        )}
      />
      
      <Controller
        name="gymInfo"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            label={t('gymInfo')}
            disabled={!isAdmin}
          />
        )}
      />
      
      <Controller
        name="gameStyle"
        control={control}
        render={({ field }) => (
          <FloatingLabelSelect
            id="game-style-select"
            value={field.value}
            onValueChange={field.onChange}
            disabled={!isAdmin}
            label={t('gameStyle')}
          >
            <SelectItem value={GameStyle.FREE_STYLE}>{t('freeStyle')}</SelectItem>
            <SelectItem value={GameStyle.RANDOM_MATCHING}>{t('randomMatching')}</SelectItem>
          </FloatingLabelSelect>
        )}
      />
      
      <Controller
        name="maxPoint"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            type="number"
            label={t('maxPoint')}
            disabled={!isAdmin}
            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            value={field.value?.toString() || ''}
          />
        )}
      />
      
      <Controller
        name="courtCount"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            type="number"
            label={t('courtCount')}
            disabled={!isAdmin}
            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
            value={field.value?.toString() || ''}
          />
        )}
      />
      
      {isAdmin && (
        <Button 
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="w-full"
        >
          {isSaving ? t('saving') : t('save')}
        </Button>
      )}
      </form>
    </div>
  )
}