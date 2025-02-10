"use client"

import React, { useEffect, useState, useMemo } from "react"
import cn from "clsx"
import { Loading } from "@/components"
import VideoList from "./VideoList"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"

export default function Page() {
  const {
    data: videos,
    error: videosError,
    isLoading: videosLoading,
  } = useSWR("/api/videos", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  console.log("videos", videos)

  return (
    <div>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Videos
      </h2>
      <div className={cn("-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4 ", "mask-gradient")}>
        <VideoList videos={videos} videosLoading={videosLoading} />
      </div>
    </div>
  )
}
