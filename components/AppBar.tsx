'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import LanguageSwitcher from './LanguageSwitcher'
import { useTranslation } from 'react-i18next'

export default function AppBar() {
  const { t } = useTranslation()
  const router = useRouter()
  const { data: session } = useSession()

  const handleLogout = async () => {
    await signOut({ redirect: false })
    router.push('/')
  }

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between bg-gray-100 border-b px-4 py-2">
      <Link href="/" className="font-semibold">{t('app.title')}</Link>
      <div className="space-x-4 flex items-center relative">
        <Link href="/" className="hover:underline">{t('nav.home')}</Link>
        {!session ? (
          <Link href="/login" className="hover:underline">{t('nav.login')}</Link>
        ) : (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  {session.user?.name || session.user?.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                {t('nav.profile')}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/user')}>
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
          </>
        )}
        <LanguageSwitcher />
      </div>
    </nav>
  )
}

