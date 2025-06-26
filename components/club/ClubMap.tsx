'use client'

import { useState } from 'react'
import { Button } from '../ui/button'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
} from '../ui/dialog'

interface ClubMapProps {
  locations: string[] // multiple addresses
}

export default function ClubMap({ locations }: ClubMapProps) {
  const { t } = useTranslation('common')
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const openMap = (provider: string) => {
    if (!selectedLocation) return
    const encoded = encodeURIComponent(selectedLocation)

    let url = ''
    switch (provider) {
      case 'apple':
        url = `https://maps.apple.com/?daddr=${encoded}`
        break
      case 'bing':
        url = `https://www.bing.com/maps?rtp=~adr.${encoded}`
        break
      case 'google':
      default:
        url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
    }

    window.open(url, '_blank')
    setDialogOpen(false)
  }

  return (
    <div className="space-y-3 px-2 max-w-md mx-auto">
      {locations.map((location, idx) => (
        <Dialog
          key={idx}
          open={dialogOpen && selectedLocation === location}
          onOpenChange={setDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-left py-4 text-base sm:text-lg"
              onClick={() => {
                setSelectedLocation(location)
                setDialogOpen(true)
              }}
            >
              📍 {location.split(',')[0]}
            </Button>
          </DialogTrigger>
          <DialogContent className="space-y-2 w-[95vw] max-w-sm p-4 rounded-lg">
            <p className="font-medium text-base sm:text-lg">{t('chooseMapApp') || 'Choose Map App'}</p>
            <Button className="w-full py-3 text-base" onClick={() => openMap('google')}>Google Maps</Button>
            <Button className="w-full py-3 text-base" onClick={() => openMap('apple')}>Apple Maps</Button>
            <Button className="w-full py-3 text-base" onClick={() => openMap('bing')}>Bing Maps</Button>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}