"use client"

import { SessionProvider } from "next-auth/react"

export function NextAuthProviders({ children }) {
  return <SessionProvider>{children}</SessionProvider>
}
