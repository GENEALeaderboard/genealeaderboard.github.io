"use client"

import { useSession } from "next-auth/react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { signIn, signOut } from "next-auth/react"

const AuthContext = createContext({
  isLoading: false,
  sessionToken: null,
  expires: null,
  email: null,
  name: null,
  username: null,
  avatar: null,
  userId: null,
  handleSignIn: () => {},
  handleSignOut: () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

export function AuthProvider({ children }) {
  const { data: session, status } = useSession()

  const userData = useMemo(() => {
    if (status === "authenticated") {
      return {
        isLoading: false,
        sessionToken: session.sessionToken || null,
        expires: session.expires || null,
        email: session.email || null,
        avatar: session.user?.image || null,
        name: session.name || null,
        username: session.username || null,
        userId: session.id || null,
        isSignedIn: true,
      }
    } else if (status === "loading") {
      return {
        isLoading: true,
        sessionToken: null,
        expires: null,
        email: null,
        avatar: null,
        name: null,
        username: null,
        userId: null,
        isSignedIn: false,
      }
    } else {
      return {
        isLoading: false,
        sessionToken: null,
        expires: null,
        email: null,
        avatar: null,
        name: null,
        username: null,
        userId: null,
        isSignedIn: false,
      }
    }
  }, [session, status])

  const handleSignIn = async () => {
    await signIn("github", { callbackUrl: "/getting-started" }) // Replace 'github' with your preferred provider
  }

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading: userData.isLoading,
        sessionToken: userData.sessionToken,
        expires: userData.expires,
        email: userData.email,
        name: userData.name,
        username: userData.username,
        avatar: userData.avatar,
        userId: userData.userId,
        isSignedIn: userData.isSignedIn,
        handleSignIn,
        handleSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
