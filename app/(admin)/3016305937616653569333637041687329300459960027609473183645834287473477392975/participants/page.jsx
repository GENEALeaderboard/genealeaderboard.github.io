"use client"

import React, { useEffect, useState } from "react"
import Study from "./User"
import cn from "clsx"
import ActionList from "@/components/actionlist"
import axios from "axios"
import { apiFetcherData } from "@/utils/fetcher"
import ParticipantList from "./ParticipantList"
import useSWR from "swr"

export default function Page() {
  const {
    data: participants,
    error,
    isLoading: loading,
  } = useSWR("/api/participants", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Prolific Participants</h1>
      <p className="mt-6 leading-7 first:mt-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        All Prolific participants screen
      </h2>
      <div className="-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4  mask-gradient">
        <ParticipantList loading={loading} participants={participants} />
      </div>
    </div>
  )
}
