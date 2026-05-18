"use client"

import React, { useEffect, useState } from "react"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcherData, apiPatch } from "@/utils/fetcher"
import { Callout } from "@/nextra"

const INPUTCODE_TYPE = "seamless-dyadic-mismatch"

export default function Page() {
  const { data: codes, isLoading: loading } = useSWR(`/api/inputcode?type=${INPUTCODE_TYPE}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const [inputCodes, setInputCodes] = useState("")
  const [state, setState] = useState({ type: "", message: null })

  useEffect(() => {
    if (codes) setInputCodes(codes.join(",\n"))
  }, [codes])

  const handleChangeCodes = async () => {
    const codeList = inputCodes.replace(/\n/g, "")
    const res = await apiPatch("/api/inputcode", { codes: codeList, type: INPUTCODE_TYPE })
    setState({ message: res.msg, type: res.success ? "info" : "error" })
  }

  if (loading) return <Loading></Loading>
  if (state.message) return <Callout type={state.type}>{state.message}</Callout>

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Seamless Dyadic Mismatch Input Codes</h1>
      <p className="text-sm text-gray-500">Input codes for Seamless Dyadic Mismatch studies (origin + mismatch pools).</p>

      <div className="mt-3 text-center flex gap-2 justify-center items-center">
        <button
          className="cursor-pointer text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white whitespace-nowrap rounded-md transition-all"
          onClick={handleChangeCodes}
        >
          Update Database
        </button>
      </div>
      <div className="flex flex-row items-center gap-4">
        <label htmlFor="codes" className="flex justify-end w-[15%]">Inputs Codes</label>
        <textarea
          className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm"
          id="codes"
          rows="7"
          name="codes"
          value={inputCodes}
          onChange={(e) => setInputCodes(e.target.value)}
        />
      </div>
    </div>
  )
}
