"use client"

import React, { useEffect, useRef, useState } from "react"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcherData, apiPatch } from "@/utils/fetcher"
import { Callout } from "@/nextra"

// Admin editor for matched-mismatched input-code pairs of a mismatching-seamless
// study. Pairs are uploaded as a text file — one pair per line — or pasted/edited
// directly. On save the geneaapi endpoint validates every code before storing.
//
// Two conventions, selected with `positional`:
//   - suffix (dyadic/speech, default): the mismatched clip is the one ending in
//     "_M"; order on the line does not matter.
//   - positional (semantic): the first code is matched, the second is the
//     mismatched/distractor clip.
export default function InputCodePairs({ type, title, description, positional = false }) {
  const {
    data: pairs,
    isLoading: loading,
  } = useSWR(`/api/inputcode-pairs?type=${type}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const [text, setText] = useState("")
  const [state, setState] = useState({ type: "", message: null })
  const fileRef = useRef(null)

  useEffect(() => {
    if (pairs && pairs.length > 0) {
      setText(pairs.map((p) => `(${p.matched}, ${p.mismatched})`).join("\n"))
    }
  }, [pairs])

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const content = await file.text()
    setText(content)
  }

  const handleSave = async () => {
    const res = await apiPatch("/api/inputcode-pairs", { pairs: text, type })
    setState({ message: res.msg, type: res.success ? "info" : "error" })
  }

  if (loading) return <Loading></Loading>
  if (state.message) return <Callout type={state.type}>{state.message}</Callout>

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{title}</h1>
      <p className="text-sm text-gray-500">{description}</p>
      {positional ? (
        <p className="text-sm text-gray-500">
          Upload a text file with one pair per line, each with two codes (e.g.{" "}
          <code>(matched_clip, mismatched_clip)</code>). Order matters — the first code is the
          matched clip (its own description is the correct answer) and the second is the
          mismatched clip (its description is shown as the distractor). Every code is validated
          against the database before saving.
        </p>
      ) : (
        <p className="text-sm text-gray-500">
          Upload a text file with one pair per line, each with two codes (e.g.{" "}
          <code>(clip, clip_M)</code>). Order does not matter — the code ending in{" "}
          <code>_M</code> is treated as the mismatched clip and the other as the matched
          clip. Exactly one code per line must end with <code>_M</code>. Every code is
          validated against the database before saving.
        </p>
      )}

      <div className="mt-3 flex gap-3 justify-center items-center">
        <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={handleFile} className="text-sm" />
        <button
          className="cursor-pointer text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white whitespace-nowrap rounded-md transition-all"
          onClick={handleSave}
        >
          Validate &amp; Update Database
        </button>
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="pairs" className="flex justify-end w-[15%]">Matched / Mismatched Pairs</label>
        <textarea
          className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm"
          id="pairs"
          rows="10"
          name="pairs"
          placeholder={positional ? "(matched_1, mismatched_1)\n(matched_2, mismatched_2)" : "(clip_1, clip_1_M)\n(clip_2, clip_2_M)"}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  )
}
