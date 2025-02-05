"use client"

import { useState, useEffect, createContext } from "react"
import { signIn, signOut } from "next-auth/react"

// const AuthContext = createContext({
//   email: "",
//   avatar: "",
//   name: "",
//   signIn: () => {},
//   signOut: () => {},
// })

export function useLocalAuth() {
  const [localUser, setLocalUser] = useState(null)
  const [email, setEmail] = useState("")
  const [avatar, setAvatar] = useState("")
  const [name, setName] = useState("")

  useEffect(() => {
    const email = localStorage.getItem("email")
    const avatar = localStorage.getItem("avatar")
    const name = localStorage.getItem("name")
  }, [])

  useEffect(() => {
    // Check localStorage on component mount
    const storedAuth = localStorage.getItem("github-auth")

    if (storedAuth) {
      const parsedAuth = JSON.parse(storedAuth)

      // Check if token is still valid
      if (parsedAuth.expiresAt > Date.now()) {
        setLocalUser(parsedAuth)
      } else {
        // Remove expired token
        localStorage.removeItem("github-auth")
      }
    }
  }, [])

  const handleSignIn = () => signIn("github")

  const handleSignOut = () => {
    signOut({ redirectTo: "/" })
    localStorage.removeItem("github-auth")
    setLocalUser(null)
  }

  return {
    user: localUser?.user,
    email: email,
    avatar: avatar,
    name: name,
    signIn: handleSignIn,
    signOut: handleSignOut,
  }
}
