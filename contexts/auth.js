"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  AUTH_API_ENDPOINT,
  GITHUB_CLIENT_ID,
  GITHUB_REDIRECT_URI,
} from "@/config/constants"

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
      // Attempt to get the cached user from localStorage
      const cachedUser = localStorage.getItem("authUser")

      if (cachedUser) {
        setUser(JSON.parse(cachedUser))
        setLoading(false)
        return
      }

      console.log("AUTH_API_ENDPOINT", `${AUTH_API_ENDPOINT}/auth/user`)
      // Fetch from the API if no cached user
      const res = await fetch(`${AUTH_API_ENDPOINT}/auth/user`, {
        credentials: "include", // Important for sending cookies
      })

      if (res.ok) {
        const resJSON = await res.json()
        console.log("resJSON", resJSON)
        setUser(resJSON.data)
        localStorage.setItem("authUser", JSON.stringify(resJSON.data)) // Cache user
      } else {
        console.log("Login failed")
        localStorage.removeItem("authUser") // Remove cache if session is invalid
      }
    } catch (error) {
      console.error("Error checking user session:", error)
      localStorage.removeItem("authUser")
    } finally {
      setLoading(false)
    }
  }

  const login = () => {
    const redirectURI = encodeURIComponent(GITHUB_REDIRECT_URI)
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${redirectURI}&scope=read:user user:email`
    window.location.href = githubAuthUrl
  }

  const logout = async () => {
    try {
      const res = await fetch(`${AUTH_API_ENDPOINT}/auth/logout`, {
        method: "POST"
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
