'use client'

import AppBar from '@/components/AppBar'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import { I18nProvider } from './providers/I18nProvider'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <I18nProvider>
        <div className="flex flex-col min-h-dvh">
          <AppBar />
          <main className="flex-grow">{children}</main>
        </div>
      </I18nProvider>
    </SessionProvider>
  );
}
