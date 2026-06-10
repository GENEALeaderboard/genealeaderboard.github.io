"use client"

import React, { useMemo, useState } from "react"
import useSWR from "swr"
import { clsx as cn } from "clsx"
import { Callout } from "@/nextra"
import { ArrowRightIcon } from "@/nextra/icons"
import CircleLoading from "@/icons/circleloading"
import { uploadFetcherData } from "@/utils/fetcher"

function formatBytes(bytes) {
  if (bytes === 0 || bytes == null) return "0 B"
  const units = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

// Turn the flat list of R2 objects into a nested tree keyed by path segment.
// Each node: { name, children: Map, file?: { size, uploaded } }
function buildTree(objects) {
  const root = { name: "", children: new Map(), file: null }
  for (const obj of objects) {
    const parts = obj.key.split("/").filter(Boolean)
    let node = root
    parts.forEach((part, idx) => {
      const isLeaf = idx === parts.length - 1
      if (!node.children.has(part)) {
        node.children.set(part, { name: part, children: new Map(), file: null })
      }
      node = node.children.get(part)
      if (isLeaf) node.file = { size: obj.size, uploaded: obj.uploaded }
    })
  }
  return root
}

// Number of files (leaves) below a folder node — shown as a count badge.
function countFiles(node) {
  if (node.file) return 1
  let total = 0
  for (const child of node.children.values()) total += countFiles(child)
  return total
}

function TreeNode({ node, depth }) {
  const [open, setOpen] = useState(depth < 2)
  const isFolder = node.children.size > 0
  const padding = { paddingLeft: `${depth * 1.1}rem` }

  if (!isFolder) {
    // File leaf.
    return (
      <div
        className="flex items-center justify-between gap-3 py-1 pr-2 text-sm text-slate-600 dark:text-slate-300"
        style={padding}
      >
        <span className="flex items-center gap-2 truncate">
          <span className="text-slate-400">📄</span>
          <span className="truncate">{node.name}</span>
        </span>
        {node.file && (
          <span className="shrink-0 tabular-nums text-xs text-slate-400">{formatBytes(node.file.size)}</span>
        )}
      </div>
    )
  }

  const children = [...node.children.values()].sort((a, b) => {
    const aFolder = a.children.size > 0
    const bFolder = b.children.size > 0
    if (aFolder !== bFolder) return aFolder ? -1 : 1 // folders first
    return a.name.localeCompare(b.name)
  })

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 rounded py-1 pr-2 text-sm font-medium text-slate-700 hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-primary-100/5"
        style={padding}
      >
        <span className="flex items-center gap-2 truncate">
          <ArrowRightIcon className={cn("h-3 shrink-0 transition-transform", open && "rotate-90")} />
          <span className="text-amber-500">{open ? "📂" : "📁"}</span>
          <span className="truncate">{node.name}</span>
        </span>
        <span className="shrink-0 text-xs text-slate-400">{countFiles(node)}</span>
      </button>
      {open && children.map((child) => <TreeNode key={child.name} node={child} depth={depth + 1} />)}
    </div>
  )
}

export default function Page() {
  const { data, error, isLoading } = useSWR("/api/storage", uploadFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const tree = useMemo(() => (data?.objects ? buildTree(data.objects) : null), [data])

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

      {!isLoading && !error && tree && tree.children.size === 0 && (
        <Callout type="info">No files found in storage.</Callout>
      )}

      {!isLoading && !error && tree && tree.children.size > 0 && (
        <div className="mt-2 rounded-lg border border-neutral-200/70 p-3 dark:border-primary-100/10">
          {[...tree.children.values()].map((child) => (
            <TreeNode key={child.name} node={child} depth={0} />
          ))}
        </div>
      )}
    </div>
  )
}
