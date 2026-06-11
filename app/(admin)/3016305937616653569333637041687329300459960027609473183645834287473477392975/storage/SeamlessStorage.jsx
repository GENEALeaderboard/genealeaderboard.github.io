"use client"

import React from "react"
import useSWR from "swr"
import { Callout } from "@/nextra"
import CircleLoading from "@/icons/circleloading"
import { uploadFetcherData } from "@/utils/fetcher"
import StorageTree from "./StorageTree"

// One folder (R2 prefix) section: fetches its objects independently and renders
// a collapsible tree rooted at the system folders inside it.
function StorageFolderSection({ label, folder }) {
  const prefix = `videos/${folder}/`
  const { data, error, isLoading } = useSWR(`/api/storage?prefix=${encodeURIComponent(prefix)}`, uploadFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <div className="rounded-lg border border-neutral-200/70 dark:border-primary-100/10">
      <div className="flex items-center justify-between gap-2 border-b border-neutral-200/70 px-4 py-2 dark:border-primary-100/10">
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{label}</span>
          <code className="text-xs text-slate-400">{prefix}</code>
        </div>
        {data && <span className="shrink-0 text-xs text-slate-400">{data.count} file{data.count === 1 ? "" : "s"}</span>}
      </div>

      <div className="p-3">
        {isLoading && (
          <p className="flex items-center gap-2 py-1 text-sm text-slate-500">
            <CircleLoading />
            Loading ...
          </p>
        )}
        {error && <Callout type="error">Failed to load this folder.</Callout>}
        {!isLoading && !error && data && (
          <StorageTree objects={data.objects || []} stripPrefix={prefix} emptyLabel="No videos uploaded to this folder yet." />
        )}
      </div>
    </div>
  )
}

// Study-level storage view: shows one section per R2 folder the study uses.
// `folders` is an array of { label, folder } (folder is the path segment under "videos/").
export default function SeamlessStorage({ title, description, folders }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="mt-10 border-b border-neutral-200/70 pb-1 text-3xl font-semibold tracking-tight text-slate-900 contrast-more:border-neutral-400 dark:border-primary-100/10 dark:text-slate-100 contrast-more:dark:border-neutral-400">
        {title}
      </h2>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>}

      <div className="mt-2 flex flex-col gap-4">
        {folders.map((f) => (
          <StorageFolderSection key={f.folder} label={f.label} folder={f.folder} />
        ))}
      </div>
    </div>
  )
}
