"use client"

import { useState } from "react"
import { clsx as cn } from "clsx"
import UploadSeamlessVideos from "../upload_seamless/uploadseamlessvideos"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

// Speech Mismatch reuses the systems registered under the Seamless Human-Likeness pool.
const SYSTEMS_CATEGORY = "seamless-origin-humanlikeness"
// Speech Mismatch has its own video pool (no longer reuses the realism origin pool).
// Matched and mismatched videos share filenames (one per input code) and live in
// sibling R2 folders under the same parent: videos/seamless-speech-mismatch/<variant>/...
const VIDEO_TYPE_BASE = "seamless-speech-mismatch"
const VARIANTS = [
  { key: "matched", label: "Matched" },
  { key: "mismatched", label: "Mismatched" },
]

export default function Page() {
  const [variant, setVariant] = useState("matched")

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
        Upload the <strong>matched</strong> and <strong>mismatched</strong> videos for this study. Pick the side below,
        then upload the clips for the selected system. Files land in R2 under{" "}
        <code>videos/{VIDEO_TYPE_BASE}/{variant}/...</code> and are recorded with video type{" "}
        <code>{`${VIDEO_TYPE_BASE}/${variant}`}</code>. Both sides should contain the same filenames (one per input code).
      </p>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">
        Upload Seamless Speech Mismatch Videos
      </h4>

      <div className="mt-6 flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Uploading:</span>
        <div className="inline-flex rounded-md border border-neutral-300 p-1">
          {VARIANTS.map((v) => (
            <button
              key={v.key}
              type="button"
              onClick={() => setVariant(v.key)}
              className={cn(
                "cursor-pointer rounded px-4 py-1.5 text-sm font-medium transition-colors",
                variant === v.key
                  ? "bg-neutral-800 text-white dark:bg-white dark:text-black"
                  : "text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300"
              )}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 mb-32">
        {systemsLoading ? (
          <div className="w-full px-12 justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          // Remount on variant change so any selected files reset and can't be
          // uploaded to the wrong side after toggling.
          <UploadSeamlessVideos
            key={variant}
            systems={systems}
            videosLoading={systemsLoading}
            videoType={`${VIDEO_TYPE_BASE}/${variant}`}
          />
        )}
      </div>
    </>
  )
}
