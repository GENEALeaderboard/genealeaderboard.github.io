"use client"

import { Callout } from "@/nextra"
import { useEffect } from "react"

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div>
      <Callout title="Something went wrong!">Unknow Error, please contact support</Callout>
    </div>
  )
}
