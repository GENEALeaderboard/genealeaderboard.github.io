"use client"

import React, { useEffect, useState } from "react"
import Study from "./Study"
import { Code, Pre, Table, Th, Tr } from "@/nextra"
import cn from "clsx"
import axios from "axios"
import { apiFetcher } from "@/utils/fetcher"

export default function Page() {
  const [studies, setStudies] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchStudies() {
    setLoading(true)
    const res = await apiFetcher("/api/studies")
    if (res.data.success) {
      setStudies(res.data.studies)
      setLoading(false)
    } else {
      console.error(res.error)
    }
  }

  useEffect(() => {
    fetchStudies()
  }, [])

  return (
    <div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Study screen</h1>
      <p className="mt-6 leading-7 first:mt-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        All study screen
      </h2>
      <div className={cn("mt-6 overflow-x-auto overscroll-x-contain")}>
        <Study loading={loading} studies={studies} />
      </div>
    </div>
  )
}
