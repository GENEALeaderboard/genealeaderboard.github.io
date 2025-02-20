"use client"

import React, { useEffect, useState } from "react"
import Study from "./Study"
import { Code, Pre, Table, Th, Tr } from "@/nextra"
import cn from "clsx"
import axios from "axios"
import { apiFetcher, apiFetcherData } from "@/utils/fetcher"
import useSWR from "swr"
import Link from "next/link"
import { API_ENDPOINT } from "@/config/constants"

export default function Page() {
  const {
    data: studies,
    error,
    isLoading: loading,
  } = useSWR("/api/studies", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <div>
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Study screen</h1>
      <p className="mt-6 leading-7 first:mt-0">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
      <div className="w-full flex justify-end">
        <Link
          href={`${API_ENDPOINT}/api/studies`}
          target="_blank"
          className="cursor-pointer select-none flex h-10 items-center gap-2 w-70 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white transition-all "
        >
          Download Studies JSON
        </Link>
      </div>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        All study screen
      </h2>
      <div className="-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4  mask-gradient">
        <Study loading={loading} studies={studies} />
      </div>
    </div>
  )
}
