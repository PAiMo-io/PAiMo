'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from './ui/button'
import { Home, CalendarDays, Users, User } from 'lucide-react'

export default function AppFooter() {
  const { data: session } = useSession()
  const pathname = usePathname()
  if (!session) return null
  const isHome = pathname === '/'
  const isEvents = pathname.startsWith('/events') || pathname === '/event-edit'
  const isClubs = pathname.startsWith('/clubs') || pathname === '/myclub'
  const isProfile = pathname === '/profile'

  const btnClass = (active: boolean) =>
    `flex flex-col items-center space-y-0.5 p-1 w-20 ${active ? 'text-primary' : 'text-muted-foreground'}`

  return (
    <footer className="border-t p-2 flex items-center justify-around sticky bottom-0 bg-background">
      <Button variant="ghost" className={btnClass(isHome)} asChild>
        <Link href="/">
          <Home size={20} />
          <span className="text-xs">Home</span>
        </Link>
      </Button>
      <Button variant="ghost" className={btnClass(isEvents)} asChild>
        <Link href="/events">
          <CalendarDays className="h-5 w-5" />
          <span className="text-xs">Event</span>
        </Link>
      </Button>
      <Button variant="ghost" className={btnClass(isClubs)} asChild>
        <Link href="/myclub">
          <Users className="h-5 w-5" />
          <span className="text-xs">Club</span>
        </Link>
      </Button>
      <Button variant="ghost" className={btnClass(isProfile)} asChild>
        <Link href="/profile">
          <User className="h-5 w-5" />
          <span className="text-xs">Profile</span>
        </Link>
      </Button>
    </footer>
  )
}
