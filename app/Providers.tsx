"use client";

import AppBar from "@/components/AppBar";
import AppFooter from "@/components/AppFooter";
import { SessionProvider } from "next-auth/react";
import type { ReactNode } from "react";
import type { Session } from "next-auth";
import { I18nProvider } from "./providers/I18nProvider";

export function Providers({
  children,
  session,
}: {
  children: ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider session={session}>
      <I18nProvider>
        <div className="flex flex-col h-full w-full">
          <AppBar />
          <main className="flex-grow overflow-y-auto">{children}</main>
          <AppFooter />
        </div>
      </I18nProvider>
    </SessionProvider>
  );
}
