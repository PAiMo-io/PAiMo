
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./Providers";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";




export const metadata: Metadata = {
  title: "PAiMO",
  description: "PAiMO is a club/event manage web app build for our lovely PIV Club members",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getServerSession(authOptions)
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body suppressHydrationWarning className="h-dvh overflow-x-hidden overflow-y-hidden overscroll-contain">
        <Providers session={session}>
          {children}
        </Providers>
      </body>
    </html>
  )
}

