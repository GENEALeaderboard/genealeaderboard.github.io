"use client"

import { useAuth } from "@/contexts/auth"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [loading, user, router])

  if (loading) return <div>Loading...</div>
  if (!user) return null

  return (
    <div>
      <h1>Protected Page</h1>
      <p>Welcome {user.name}!</p>
    </div>
  )
}
