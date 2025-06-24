'use client'

import AppBar from '@/components/AppBar'
import AppFooter from '@/components/AppFooter'
import { SessionProvider } from 'next-auth/react'
import type { ReactNode } from 'react'
import type { Session } from 'next-auth'
export function Providers({
  children,
  session,
}: {
  children: ReactNode
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <div className="flex flex-col h-full">
        <AppBar />
        <main className="flex-grow overflow-y-auto">{children}</main>
        <AppFooter />
      </div>
    </SessionProvider>
  );
}
