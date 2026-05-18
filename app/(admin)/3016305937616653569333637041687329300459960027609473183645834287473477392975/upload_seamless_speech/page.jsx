"use client"

import UploadSeamlessVideos from "../upload_seamless/uploadseamlessvideos"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

// Speech Mismatch reuses the systems registered under the Seamless Human-Likeness pool.
const SYSTEMS_CATEGORY = "seamless-origin-humanlikeness"
const VIDEO_TYPE = "seamless-speech-mismatch"

export default function Page() {
  const {
    data: systems,
    isLoading: systemsLoading,
  } = useSWR(`/api/systems?category=${SYSTEMS_CATEGORY}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70">
        Seamless Speech Mismatch Videos
      </h2>
      <p className="mt-3 text-sm text-gray-500">
        Upload the mismatch-side videos. They land in R2 under <code>videos/{VIDEO_TYPE}/...</code> and use the Seamless Human-Likeness system list.
        Origin-side videos are uploaded via the Seamless Videos page.
      </p>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Seamless Speech Mismatch Videos</h4>
      <div className="mt-6 mb-32">
        {systemsLoading ? (
          <div className="w-full px-12 justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          <UploadSeamlessVideos systems={systems} videosLoading={systemsLoading} videoType={VIDEO_TYPE} />
        )}
      </div>
    </>
  )
}
