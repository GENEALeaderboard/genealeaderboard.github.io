"use client"

import { clsx as cn } from "clsx"
import React, { useMemo, useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Callout } from "@/nextra"
import { Select } from "@headlessui/react"
import { ArrowLeftIcon } from "@/nextra/icons"
import CircleLoading from "@/icons/circleloading"
import { apiFetcherData, apiPost } from "@/utils/fetcher"
import { SYSTEM_TYPES } from "@/config/constants"
import { incrementAlpha } from "../systems/utils"

// The four seamless-interaction evaluations a system can belong to.
const SEAMLESS_EVALS = [
  { category: "seamless-origin-humanlikeness", label: "Human-Likeness" },
  { category: "seamless-speech-mismatch", label: "Speech Mismatch" },
  { category: "seamless-dyadic-mismatch", label: "Dyadic Mismatch" },
  { category: "seamless-semantic-mismatch", label: "Semantic Mismatch" },
]

export default function Page() {
  const { mutate } = useSWRConfig()

  // One list per seamless evaluation, so we can show a coverage matrix.
  const results = SEAMLESS_EVALS.map((evalDef) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useSWR(`/api/system-list?category=${evalDef.category}`, apiFetcherData, {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    })
  )

  const isLoading = results.some((r) => r.isLoading)
  const isError = results.some((r) => r.error)

  // category -> Set of system names present in that pool
  const byCategory = useMemo(() => {
    const map = {}
    SEAMLESS_EVALS.forEach((evalDef, i) => {
      map[evalDef.category] = new Set((results[i].data || []).map((s) => s.name))
    })
    return map
  }, [results.map((r) => r.data)])

  // Distinct system names across all pools, with their type (for display).
  const allSystems = useMemo(() => {
    const seen = new Map() // name -> type
    results.forEach((r) => (r.data || []).forEach((s) => seen.set(s.name, s.type)))
    return [...seen.entries()].map(([name, type]) => ({ name, type })).sort((a, b) => a.name.localeCompare(b.name))
  }, [results.map((r) => r.data)])

  function refresh() {
    SEAMLESS_EVALS.forEach((evalDef) => mutate(`/api/system-list?category=${evalDef.category}`))
  }

  if (isLoading) {
    return (
      <div className="w-full px-12 justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  if (isError) {
    return <Callout type="error">Failed to connect, please contact support</Callout>
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Seamless Systems
      </h2>
      <p className="text-sm text-gray-500">
        Register a system into the seamless-interaction evaluations in one step. Seamless systems are not tied to a team submission.
      </p>

      <CoverageMatrix systems={allSystems} byCategory={byCategory} />

      <CreateSeamlessSystem existingSystems={allSystems} onCreated={refresh} />
    </div>
  )
}

function CoverageMatrix({ systems, byCategory }) {
  if (!systems || systems.length === 0) {
    return (
      <div className="mt-4">
        <Callout type="info">No seamless systems registered yet.</Callout>
      </div>
    )
  }
  return (
    <div className={cn("-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4", "mask-gradient")}>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b py-4 text-left dark:border-neutral-700">
            <th className="py-2 pl-6 font-semibold">System</th>
            <th className="py-2 pl-6 font-semibold">Type</th>
            {SEAMLESS_EVALS.map((e) => (
              <th key={e.category} className="py-2 px-3 font-semibold text-center">
                {e.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="align-baseline text-gray-900 dark:text-gray-100">
          {systems.map((system) => (
            <tr key={system.name} className="border-b border-gray-100 dark:border-neutral-700/50 align-middle">
              <td className="py-2 pl-6 font-bold">{system.name}</td>
              <td className="py-2 pl-6">{system.type}</td>
              {SEAMLESS_EVALS.map((e) => (
                <td key={e.category} className="py-2 px-3 text-center">
                  {byCategory[e.category].has(system.name) ? (
                    <span className="text-green-600 dark:text-green-400">✓</span>
                  ) : (
                    <span className="text-gray-300 dark:text-neutral-600">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function CreateSeamlessSystem({ existingSystems, onCreated }) {
  const [systemType, setSystemType] = useState("system")
  const [systemname, setSystemName] = useState("")
  const [description, setDescription] = useState("")
  const [selected, setSelected] = useState(() => new Set(SEAMLESS_EVALS.map((e) => e.category)))
  const [state, setState] = useState({ type: "", message: "" })
  const [submitting, setSubmitting] = useState(false)

  // Next "S__" name, derived from existing system-typed names across all pools.
  const nextSystemName = useMemo(() => {
    const names = existingSystems.map((s) => s.name).filter((name) => /^S[A-Z]+$/.test(name))
    const sorted = [...new Set(names)].sort()
    const last = sorted.length > 0 ? sorted[sorted.length - 1] : "S"
    return `S${incrementAlpha(last.slice(1))}`
  }, [existingSystems])

  // Keep name/description in sync with the chosen type.
  React.useEffect(() => {
    switch (systemType) {
      case "groundtruth":
        setSystemName("NA")
        setDescription((d) => d || "Ground truth system")
        break
      case "baseline":
        setSystemName("BA")
        setDescription((d) => d || "Baseline System")
        break
      case "system":
        setSystemName(nextSystemName)
        setDescription((d) => d || "System")
        break
      default:
        break
    }
  }, [systemType, nextSystemName])

  function toggle(category) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(category)) next.delete(category)
      else next.add(category)
      return next
    })
  }

  async function onSubmit(e) {
    e.preventDefault()
    setState({ type: "", message: "" })

    const categories = SEAMLESS_EVALS.map((ev) => ev.category).filter((c) => selected.has(c))
    if (categories.length === 0) {
      setState({ type: "error", message: "Select at least one evaluation." })
      return
    }

    setSubmitting(true)
    try {
      const newSystem = { name: systemname, type: systemType, description }
      const res = await apiPost("/api/systems/seamless", { newSystem, categories })
      if (res.success) {
        setState({ type: "info", message: res.msg })
        onCreated?.()
      } else {
        setState({ type: "error", message: res.msg })
      }
    } catch (error) {
      console.error(error)
      setState({ type: "error", message: "Something went wrong, please try again." })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Create System
      </h2>

      {state.message && (
        <div className="mt-4">
          <Callout type={state.type === "error" ? "error" : "info"}>{state.message}</Callout>
        </div>
      )}

      <form className="mt-2 mb-6 flex flex-col px-4 gap-4" onSubmit={onSubmit}>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="systemtype" className="w-[20%] flex justify-end">
            System Type
          </label>
          <div className="relative items-center align-middle flex-grow">
            <Select
              id="systemtype"
              name="systemtype"
              value={systemType}
              onChange={(e) => setSystemType(e.target.value)}
              className={cn(
                "w-full appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
              )}
            >
              {SYSTEM_TYPES.map((sysType) => (
                <option key={sysType} value={sysType} className="text-gray-800 dark:text-gray-100">
                  {sysType}
                </option>
              ))}
            </Select>
            <ArrowLeftIcon className="pointer-events-none absolute top-2.5 right-2.5 size-5 ltr:rotate-90" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="systemname" className="w-[20%] flex justify-end">
            System Name
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="systemname"
            type="text"
            name="systemname"
            value={systemname}
            onChange={(e) => setSystemName(e.target.value)}
          />
        </div>

        <div className="flex flex-row items-start gap-4">
          <label className="w-[20%] flex justify-end pt-2">Evaluations</label>
          <div className="flex-grow flex flex-col gap-2">
            {SEAMLESS_EVALS.map((ev) => (
              <label key={ev.category} className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={selected.has(ev.category)} onChange={() => toggle(ev.category)} className="size-4" />
                <span>{ev.label}</span>
                <code className="text-xs text-gray-400">{ev.category}</code>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="description" className="w-[20%] flex justify-end">
            Description
          </label>
          <textarea
            id="description"
            tabIndex="0"
            className="w-[80%] p-4 rounded-lg min-h-36 appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="flex flex-col items-center">
          <div className="pl-[20%] flex justify-start">
            <button
              type="submit"
              disabled={submitting}
              className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent text-white bg-black px-4 py-2 text-base font-bold focus:outline-none focus:ring-2 focus:ring-gray-800 disabled:opacity-50 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm transition-all"
            >
              {submitting ? "Creating ..." : "Create System"}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
