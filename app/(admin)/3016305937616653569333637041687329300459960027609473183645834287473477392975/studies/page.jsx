"use client"

import React, { useEffect, useState } from "react"
import { Code, Pre, Table, Th, Tr } from "@/nextra"
import cn from "clsx"
import axios from "axios"
import { apiFetcher, apiFetcherData, apiPatch } from "@/utils/fetcher"
import useSWR from "swr"
import Link from "next/link"
import { API_ENDPOINT } from "@/config/constants"

export default function Page() {
  const {
    data: studies,
    mutate,
  } = useSWR("/api/studies", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const [disabling, setDisabling] = useState(false)
  const [disableMsg, setDisableMsg] = useState(null)

  const newCount = Array.isArray(studies) ? studies.filter((s) => s.status === "new").length : 0

  const handleDisableNew = async () => {
    if (newCount === 0) return
    if (!window.confirm(`Disable ${newCount} study screen(s) with status "new"? They will be marked "failed" and no longer served to participants. This does not delete them.`)) {
      return
    }
    setDisabling(true)
    setDisableMsg(null)
    try {
      const res = await apiPatch("/api/studies/fail-new")
      setDisableMsg({ type: res.success ? "info" : "error", text: res.msg })
      if (res.success) await mutate()
    } catch (err) {
      setDisableMsg({ type: "error", text: "Failed to disable new studies" })
    } finally {
      setDisabling(false)
    }
  }

  return (
    <div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Study screen</h1>
      <p className="mt-6 leading-7 first:mt-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <div className="w-full flex justify-end items-center gap-3">
        {disableMsg && (
          <span className={cn("text-xs font-medium", disableMsg.type === "error" ? "text-red-600" : "text-green-600")}>{disableMsg.text}</span>
        )}
        <button
          type="button"
          onClick={handleDisableNew}
          disabled={disabling || newCount === 0}
          className="cursor-pointer select-none flex h-10 items-center gap-2 justify-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-xs font-bold text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 betterhover:hover:bg-red-700"
        >
          {disabling ? "Disabling..." : `Disable all new studies${newCount ? ` (${newCount})` : ""}`}
        </button>
        <Link
          href={`${API_ENDPOINT}/api/studies`}
          target="_blank"
          className="cursor-pointer select-none flex h-10 items-center gap-2 w-70 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white transition-all "
        >
          Download Studies JSON
        </Link>
      </div>
    </div>
  )
}
