'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Menu } from 'lucide-react'

import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export default function AppBar() {
  const { t } = useTranslation()
  const router = useRouter()
  const pathname = usePathname()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  const eventMatch = pathname.match(/^\/events\/(\w+)/)
  const eventId = eventMatch ? eventMatch[1] : null

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-gray-100 border-b px-4 py-2">
      <Link href="/" className="font-semibold">PAiMO.io</Link>
      <div className="flex items-center space-x-2 relative">
        {!session ? (
          <>
            <Link href="/login" className="hover:underline">{t('nav.login')}</Link>
            <LanguageSwitcher />
          </>
        ) : (
          <div className="flex items-center">
            <LanguageSwitcher />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <Menu />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/myclub')}>
                  {t('nav.myClubs')}
                </DropdownMenuItem>
                {(session.user?.role === 'super-admin' || session.user?.role === 'admin') && (
                  <DropdownMenuItem onSelect={() => router.push('/event-edit')}>
                    {t('nav.eventEdit')}
                  </DropdownMenuItem>
                )}
                {session.user?.role === 'super-admin' && (
                  <DropdownMenuItem onSelect={() => router.push('/manage')}>
                    {t('nav.manage')}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onSelect={handleLogout}>
                  {t('nav.logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </nav>
  )
}

