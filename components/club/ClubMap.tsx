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

  const openNativeMap = () => {
    if (!selectedLocation) return

    const encoded = encodeURIComponent(selectedLocation)
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent)
    const isAndroid = /Android/i.test(navigator.userAgent)

    let url = ''

    if (isIOS) {
      url = `http://maps.apple.com/?daddr=${encoded}`
    } else if (isAndroid) {
      url = `geo:0,0?q=${encoded}`
    } else {
      // Fallback for desktop
      url = `https://www.google.com/maps/dir/?api=1&destination=${encoded}`
    }

    window.location.href = url
    setDialogOpen(false)
  }

  return (
    <div className="space-y-3">
      {locations.map((location, idx) => (
        <Dialog
          key={idx}
          open={dialogOpen && selectedLocation === location}
          onOpenChange={setDialogOpen}
        >
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-left"
              onClick={() => {
                setSelectedLocation(location)
                setDialogOpen(true)
              }}
            >
              📍 {location}
            </Button>
          </DialogTrigger>
          <DialogContent className="space-y-2">
            <p className="font-medium">{t('chooseMapApp') || 'Open in Maps'}</p>
            <Button onClick={openNativeMap}>
              {t('openNavigation') || 'Open Navigation'}
            </Button>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}