"use client"

import React from "react"
import useSWR from "swr"
import { Callout } from "@/nextra"
import CircleLoading from "@/icons/circleloading"
import { uploadFetcherData } from "@/utils/fetcher"
import StorageTree from "./StorageTree"

export default function Page() {
  const { data, error, isLoading } = useSWR("/api/storage", uploadFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <div className="flex flex-col gap-3">
      <h2 className="mt-10 border-b border-neutral-200/70 pb-1 text-3xl font-semibold tracking-tight text-slate-900 contrast-more:border-neutral-400 dark:border-primary-100/10 dark:text-slate-100 contrast-more:dark:border-neutral-400">
        Storage
      </h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Live view of the videos stored in the <code>genea</code> R2 bucket.
        {data ? ` ${data.count} file${data.count === 1 ? "" : "s"}.` : ""}
      </p>

      {isLoading && (
        <p className="flex justify-center gap-2 p-4">
          <CircleLoading />
          Loading storage ...
        </p>
      )}

      {error && <Callout type="error">Failed to load storage, please contact support.</Callout>}

      {!isLoading && !error && data && (
        <div className="mt-2 rounded-lg border border-neutral-200/70 p-3 dark:border-primary-100/10">
          <StorageTree objects={data.objects || []} emptyLabel="No files found in storage." />
        </div>
      )}
    </div>
  )
}
