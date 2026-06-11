"use client"

import UploadSeamlessVideos from "../upload_seamless/uploadseamlessvideos"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

// All four seamless studies share one systems pool, registered under
// the seamless-origin-humanlikeness category.
const SYSTEMS_CATEGORY = "seamless-origin-humanlikeness"

// Semantic mismatch has a single video folder. There is no separate mismatched
// video pool: each video is accompanied by a .txt text description in the same
// folder, and the study CSV carries the correct + mismatched descriptions.
const VIDEO_TYPE = "seamless-semantic-origin"

export default function Page() {
  const { data: systems, isLoading: systemsLoading } = useSWR(`/api/systems?category=${SYSTEMS_CATEGORY}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70">
        Seamless Semantic Mismatch Videos
      </h2>
      <p className="mt-3 text-sm text-gray-500">
        Upload the evaluation videos together with their text descriptions. Both land in R2 under <code>videos/{VIDEO_TYPE}/...</code> — one
        <code> .txt</code> file per <code>.mp4</code> video. The correct and mismatched descriptions shown to raters come from the study CSV.
      </p>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Videos &amp; Descriptions</h4>
      <div className="mt-6 mb-32">
        {systemsLoading ? (
          <div className="w-full px-12 justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          <UploadSeamlessVideos systems={systems} videosLoading={systemsLoading} videoType={VIDEO_TYPE} allowText={true} />
        )}
      </div>
    </>
  )
}
