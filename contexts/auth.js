"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Cookies from "js-cookie"

const API_URL = process.env.NEXT_PUBLIC_WORKER_URL

const AuthContext = createContext({
  user: null,
  loading: false,
  login: () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const user = Cookies.get("user")
      if (user) {
        setUser(JSON.parse(user))
      } else {
        const authToken = Cookies.get("auth-token")
        if (authToken) {
          const res = await fetch(`${API_URL}/auth/user`, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
            credentials: "include", // Important for sending cookies
          })

          if (res.ok) {
            const data = await res.json()
            console.log("checkUser.data", data)
            setUser(data.user.payload)
          }
        }
      }
    } catch (error) {
      console.log("Error checking user session:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
    const REDIRECT_URI = process.env.NEXT_PUBLIC_GITHUB_REDIRECT_URI

    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=read:user user:email`
    window.location.href = githubAuthUrl
  }

  const logout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
      setUser(null)
      router.push("/")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
