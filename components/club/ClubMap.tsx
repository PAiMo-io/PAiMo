'use client'

interface ClubMapProps {
  location: string
}

export default function ClubMap({ location }: ClubMapProps) {
  const src = `https://maps.google.com/maps?q=${encodeURIComponent(location)}&z=13&output=embed`
  return (
    <div className="w-full h-64 border rounded-md overflow-hidden">
      <iframe
        title="Club location map"
        src={src}
        width="100%"
        height="100%"
        loading="lazy"
      />
    </div>
  )
}
