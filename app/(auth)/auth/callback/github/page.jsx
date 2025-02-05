"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import { NEXT_PUBLIC_WORKER_URL } from "@/config/constants"

const CallbackPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const code = searchParams.get("code")

  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!code) return

    const exchangeToken = async () => {
      try {
        const response = await fetch(
          `${NEXT_PUBLIC_WORKER_URL}/auth/github/callback?code=${code}`
        )
        // const data = await response.json()

        // if (data.error) {
        //   throw new Error(data.error)
        // }

        // // Fetch GitHub user profile
        // const userRes = await fetch("https://api.github.com/user", {
        //   headers: { Authorization: `Bearer ${data.access_token}` },
        // })

        // const userData = await userRes.json()
        // setUser(userData)
        if (response.status === 302) {
          const newUrl = response.headers.get("Location")
          if (newUrl) {
            router.push(newUrl)
          }
        }
      } catch (err) {
        setError(err.message)
      }
    }

    exchangeToken()
  }, [code])

  if (error) {
    return (
      <div className="flex flex-col items-center">
        <p className="text-red-500">Error: {error}</p>
        <button
          className="mt-4 px-4 py-2 bg-black text-white rounded"
          onClick={() => router.push("/")}
        >
          Go Back
        </button>
      </div>
    )
  }

  if (!user) {
    return <p className="text-center">Authenticating...</p>
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold">Welcome, {user.login}!</h1>
      <img
        src={user.avatar_url}
        alt="GitHub Avatar"
        className="w-20 h-20 rounded-full mt-4"
      />
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => router.push("/")}
      >
        Go to Home
      </button>
    </div>
  )
}

export default CallbackPage
