"use client"

import React from "react"
import useSWR from "swr"
import { apiFetcherData } from "@/utils/fetcher"
import InputCodePairs from "../_components/InputCodePairs"
import SemanticTextUpload from "../_components/SemanticTextUpload"

const INPUTCODE_TYPE = "seamless-semantic-mismatch"

// Semantic Mismatch data lives in two places, both managed here:
//   1. One .txt description per input code (the correct answer for that clip).
//   2. Matched/mismatched pairs — for clip A, the distractor is clip B's .txt.
export default function Page() {
  const { data: codes } = useSWR(`/api/inputcode?type=${INPUTCODE_TYPE}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Semantic Descriptions</h1>
        <p className="text-sm text-gray-500">
          Upload one <code>.txt</code> per input code, each named after its code (e.g. <code>{"<inputcode>"}.txt</code>). Each holds the
          correct semantic description for that clip. Descriptions are system-independent — one file per clip, shared across all systems.
        </p>
        <SemanticTextUpload codes={codes || []} />
      </div>

      <div className="border-t border-neutral-200/70 pt-8">
        <InputCodePairs
          type={INPUTCODE_TYPE}
          positional
          title="Semantic Matched/Mismatched Pairs"
          description="For each clip, the distractor description shown to raters is the paired clip's description. First code = the clip shown; second code = the clip whose description becomes the distractor."
        />
      </div>
    </div>
  )
}
