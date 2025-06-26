'use client'
import { useEffect, useRef, useCallback } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { FloatingLabelInput } from '@/components/ui/floating-label-input'
import { FloatingLabelSelect } from '@/components/ui/floating-label-select'
import { SelectItem } from '@/components/ui/select'
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
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initializedRef = useRef(false)
  
  const { control, reset, getValues } = useForm<FormData>({
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
    if (!event) return
    
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
    
    reset(formData)
    initializedRef.current = true
  }, [event, reset])

  // Debounced auto-save function
  const debouncedSave = useCallback((data: FormData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }
    
    saveTimeoutRef.current = setTimeout(() => {
      onSave({
        ...data,
        registrationEndTime: data.registrationEndTime || undefined,
        playDate: data.playDate || undefined,
      })
      saveTimeoutRef.current = null
    }, 500)
  }, [onSave])

  // Handle field changes
  const handleFieldChange = useCallback(() => {
    if (!initializedRef.current || !isAdmin) return
    
    const currentData = getValues()
    debouncedSave(currentData)
  }, [isAdmin, getValues, debouncedSave])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [])

  return (
    <form className="space-y-4 mt-5 max-w-sm">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <FloatingLabelInput
            {...field}
            label={t('name')}
            disabled={!isAdmin}
            onBlur={handleFieldChange}
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
            onValueChange={(value) => {
              field.onChange(value)
              handleFieldChange()
            }}
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
            onBlur={handleFieldChange}
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
            onBlur={handleFieldChange}
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
            onBlur={handleFieldChange}
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
            onValueChange={(value) => {
              field.onChange(value)
              handleFieldChange()
            }}
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
            onBlur={handleFieldChange}
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
            onBlur={handleFieldChange}
            value={field.value?.toString() || ''}
          />
        )}
      />
    </form>
  )
}