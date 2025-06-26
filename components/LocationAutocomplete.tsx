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
        const res = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`)
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
    <div className="relative w-full">
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
        className="w-full"
      />
      {open && suggestions.length > 0 && (
        <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto animate-fade-in">
          {suggestions.map((s, idx) => (
            <div
              key={idx}
              onMouseDown={() => handleSelect(s)}
              className="px-4 py-2 cursor-pointer transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 text-gray-800 text-sm first:rounded-t-lg last:rounded-b-lg"
            >
              <span className="truncate block">{s}</span>
            </div>
          ))}
        </div>
      )}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-4px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .animate-fade-in {
          animation: fade-in 0.15s ease;
        }
      `}</style>
    </div>
  )
}
