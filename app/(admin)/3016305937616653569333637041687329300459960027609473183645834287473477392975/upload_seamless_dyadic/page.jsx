"use client"

import { useState } from "react"
import UploadSeamlessVideos from "../upload_seamless/uploadseamlessvideos"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import CircleLoading from "@/icons/circleloading"

// All four seamless studies share one systems pool, registered under
// the seamless-origin-humanlikeness category.
const SYSTEMS_CATEGORY = "seamless-origin-humanlikeness"
// Dedicated dyadic pools. Matched and mismatched videos share filenames (one per
// input code) and live in sibling R2 folders under videos/seamless-dyadic-mismatch/.
const POOLS = [
  { value: "seamless-dyadic-mismatch/matched", label: "Matched" },
  { value: "seamless-dyadic-mismatch/mismatched", label: "Mismatched" },
]

export default function Page() {
  const [videoType, setVideoType] = useState(POOLS[0].value)

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
        Seamless Dyadic Mismatch Videos
      </h2>
      <p className="mt-3 text-sm text-gray-500">
        Select which pool to upload to. Files land in R2 under <code>videos/{videoType}/...</code>.
      </p>

      <div className="mt-6 flex flex-row items-center gap-4">
        <label className="w-[20%] text-right">Pool</label>
        <div className="flex-grow flex items-center gap-6">
          {POOLS.map((p) => (
            <label key={p.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="dyadicPool"
                value={p.value}
                checked={videoType === p.value}
                onChange={(e) => setVideoType(e.target.value)}
              />
              <span>{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      <h4 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-8 text-xl">Upload Videos</h4>
      <div className="mt-6 mb-32">
        {systemsLoading ? (
          <div className="w-full px-12 justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          // key forces a fresh state when the admin switches pool.
          <UploadSeamlessVideos key={videoType} systems={systems} videosLoading={systemsLoading} videoType={videoType} />
        )}
      </div>
    </>
  )
}
