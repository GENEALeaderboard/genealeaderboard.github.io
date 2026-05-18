"use client"

import { clsx as cn } from "clsx"
import React from "react"
import SystemList from "../systems/SystemList"
import { apiFetcherData } from "@/utils/fetcher"
import useSWR from "swr"
import CircleLoading from "@/icons/circleloading"
import { Callout } from "@/nextra"
import CreateSystem from "../systems/CreateSystem"

const CATEGORY = "seamless-dyadic-mismatch"

export default function Page() {
  const {
    data: systems,
    error: systemsError,
    isLoading: systemsLoading,
  } = useSWR(`/api/system-list?category=${CATEGORY}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const {
    data: submissions,
    error: submissionError,
  } = useSWR("/api/submission-filtered", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (systemsLoading) {
    return (
      <div className="w-full px-12 justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  if (submissionError || systemsError) {
    return <Callout type="error">Failed to connect, please contact support</Callout>
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70">
        Seamless Dyadic Mismatch System List
      </h2>
      <p className="text-sm text-gray-500">Systems registered under the <code>{CATEGORY}</code> pool.</p>

      <div className={cn("-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4 ", "mask-gradient")}>
        <SystemList systems={systems} />
      </div>

      {!submissions || submissions.length === 0 ? (
        <div className="w-full px-12 justify-center">
          <Callout type="info">No submissions available. A new system can only be created after a submission has been made.</Callout>
        </div>
      ) : (
        <CreateSystem submissions={submissions} systems={systems} category={CATEGORY} />
      )}
    </div>
  )
}
