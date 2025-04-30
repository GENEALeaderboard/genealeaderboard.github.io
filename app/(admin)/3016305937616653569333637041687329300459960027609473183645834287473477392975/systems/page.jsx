"use client"

import { clsx as cn } from "clsx"
import axios from "axios"
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { Loading } from "@/components"
import { Description, Field, Label, Select } from "@headlessui/react"
import { ArrowLeftIcon, ArrowRightIcon } from "@/nextra/icons"
import SystemList from "./SystemList"
import { apiFetcherData, apiPost } from "@/utils/fetcher"
import useSWR from "swr"
import CircleLoading from "@/icons/circleloading"
import SubmissionList from "./submissionlist"
import { Callout } from "@/nextra"
import CreateSystem from "./CreateSystem"
// import { Loading } from "@/components/loading/loading"

export default function Page() {
  const {
    data: systems,
    error: systemsError,
    isLoading: systemsLoading,
  } = useSWR("/api/system-list", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const {
    data: submissions,
    error: submissionError,
    isLoading: submissionLoading,
  } = useSWR("/api/submission-filtered", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (systemsLoading) {
    return (
      <div className="w-full px-12  justify-center">
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
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        System List
      </h2>

      <div className={cn("-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4 ", "mask-gradient")}>
        <SystemList systems={systems} />
      </div>
      {/* ********************************************************************************** */}
      {!submissions || submissions.length === 0 ? (
        <div className="w-full px-12  justify-center">
          <Callout type="error">No submissions available</Callout>
        </div>
      ) : (
        <CreateSystem submissions={submissions} systems={systems} />
      )}
    </div>
  )
}
