"use client"

import { useState } from 'react'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'

interface ClubMapProps {
  location: string
}

export default function ClubMap({ location }: ClubMapProps) {
  const { t } = useTranslation('common')
  const [provider, setProvider] = useState('google')

  const src = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=13&output=embed`

  const getDirectionUrl = () => {
    switch (provider) {
      case 'apple':
        return `https://maps.apple.com/?daddr=${encodeURIComponent(location)}`
      case 'bing':
        return `https://www.bing.com/maps?rtp=~adr.${encodeURIComponent(location)}`
      default:
        return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(location)}`
    }
  }

  const openDirections = () => {
    window.open(getDirectionUrl(), '_blank')
  }

  return (
    <div>
      <div className="w-full h-64 border rounded-md overflow-hidden">
        <iframe
          title="Club location map"
          src={src}
          width="100%"
          height="100%"
          loading="lazy"
        />
      </div>
      <div className="flex items-center space-x-2 mt-2">
        <Select value={provider} onValueChange={setProvider}>
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google">Google Maps</SelectItem>
            <SelectItem value="apple">Apple Maps</SelectItem>
            <SelectItem value="bing">Bing Maps</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={openDirections}>{t('getDirections')}</Button>
      </div>
    </div>
  )
}
