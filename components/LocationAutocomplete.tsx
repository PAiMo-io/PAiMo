'use client'
import { useEffect, useState } from 'react'
import { Input } from './ui/input'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function LocationAutocomplete({ value, onChange, placeholder }: Props) {
  const [query, setQuery] = useState(value)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setQuery(value)
  }, [value])

  useEffect(() => {
    const fetchPlaces = async () => {
      if (!query) {
        setSuggestions([])
        return
      }
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        )
        const data = await res.json()
        if (data.predictions) {
          setSuggestions(data.predictions.map((p: any) => p.description))
        } else {
          setSuggestions([])
        }
      } catch (err) {
        console.error(err)
        setSuggestions([])
      }
    }
    const t = setTimeout(fetchPlaces, 300)
    return () => clearTimeout(t)
  }, [query])

  const handleSelect = (place: string) => {
    setQuery(place)
    onChange(place)
    setOpen(false)
  }

  return (
    <div className="relative">
      <Input
        placeholder={placeholder}
        value={query}
        onChange={e => {
          const val = e.target.value
          setQuery(val)
          onChange(val)
          setOpen(true)
        }}
        onFocus={() => query && suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        className="flex-1"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded shadow max-h-60 overflow-y-auto">
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              onMouseDown={() => handleSelect(s)}
              className="px-2 py-1 cursor-pointer hover:bg-gray-100"
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
