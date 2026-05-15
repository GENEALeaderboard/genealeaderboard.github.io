"use client"

import UploadSeamlessVideos from "./uploadseamlessvideos"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

export default function Page() {
  const {
    data: systems,
    error: systemsError,
    isLoading: systemsLoading,
  } = useSWR("/api/systems?category=seamless-origin-humanlikeness", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Seamless Videos
      </h2>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Video for systems</h4>
      <div className="nextra-code relative mt-6 first:mt-0">
        <pre
          className="overflow-x-auto subpixel-antialiased text-[.9em] dark:bg-black py-4 ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 contrast-more:ring-gray-900 contrast-more:dark:ring-gray-50 contrast-more:contrast-150 rounded-md"
          tabIndex="0"
          data-word-wrap=""
        >
          <code className="nextra-code" dir="ltr">
            <span><span>/videos</span></span>
            <span><span></span></span>
            <span><span>/videos/seamless-origin-humanlikeness</span></span>
            <span><span></span></span>
            <span><span>/videos/seamless-origin-humanlikeness/&lt;system_name&gt;/&lt;video_segment_name&gt;.mp4</span></span>
          </code>
        </pre>
      </div>
      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Seamless Videos</h4>
      <div className="mt-6 mb-32">
        {systemsLoading ? (
          <div className="w-full px-12  justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          <UploadSeamlessVideos systems={systems} systemsLoading={systemsLoading} />
        )}
      </div>
    </>
  )
}
