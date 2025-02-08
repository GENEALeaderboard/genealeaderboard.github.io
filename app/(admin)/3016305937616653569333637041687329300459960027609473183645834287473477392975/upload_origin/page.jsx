"use client"

import Image from "next/image"
import UploadOriginVideos from "./uploadoriginvideos"
import { useEffect, useState } from "react"
// import fetchInputCodes from "./actions"
import InputCode from "./inputcode"
import axios from "axios"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcher } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

export default function Page() {
  const {
    data: systems,
    error: systemsError,
    isLoading: systemsLoading,
  } = useSWR("/api/systems", apiFetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Origin Videos
      </h2>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Video for systems</h4>
      <div className="nextra-code relative mt-6 first:mt-0">
        <pre
          className="overflow-x-auto subpixel-antialiased text-[.9em] dark:bg-black py-4 ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 contrast-more:ring-gray-900 contrast-more:dark:ring-gray-50 contrast-more:contrast-150 rounded-md"
          tabIndex="0"
          data-word-wrap=""
        >
          <code className="nextra-code" dir="ltr">
            <span>
              <span>/videos</span>
            </span>
            <span>
              <span></span>
            </span>
            <span>
              <span>/videos/original</span>
            </span>
            <span>
              <span></span>
            </span>
            <span>
              <span>/videos/original/&lt;system_name&gt;/&lt;video_segment_name&gt;.mp4</span>
            </span>
          </code>
        </pre>
      </div>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Origin Videos</h4>
      <div className="mt-6 mb-32">
        {/* <p className="mt-3 leading-7 first:mt-0">Github information</p> */}
        {systemsLoading || status === "loading" ? (
          <div className="w-full px-12  justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          <UploadOriginVideos systems={systems} systemsLoading={systemsLoading} />
        )}
      </div>
    </>
  )
}
