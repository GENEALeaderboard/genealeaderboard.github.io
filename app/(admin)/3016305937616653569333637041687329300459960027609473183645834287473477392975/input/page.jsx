"use client"

import React, { useEffect, useState } from "react"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcherData, apiPatch } from "@/utils/fetcher"
import { Callout } from "@/nextra"

const INPUTCODE_TYPE = "origin"

export default function Page() {
  const {
    data: codes,
    error,
    isLoading: loading,
  } = useSWR(`/api/inputcode?type=${INPUTCODE_TYPE}`, apiFetcherData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    shouldRetryOnError: true,
    errorRetryCount: 3,
  })
  const [inputCodes, setInputCodes] = useState("")
  const [state, setState] = useState({ type: "", message: null })

  useEffect(() => {
    if (codes) {
      setInputCodes(codes.join(",\n"))
    }
  }, [codes])

  const handleChangeCodes = async () => {
    const codeList = inputCodes.replace(/\n/g, "")
    const res = await apiPatch("/api/inputcode", { codes: codeList, type: INPUTCODE_TYPE })

    if (res.success) {
      setState({ message: res.msg, type: "info" })
    } else {
      setState({ message: res.msg, type: "error" })
      console.log("Insert new inputs code failed", res)
    }
  }

  if (loading) {
    return <Loading></Loading>
  }

  if (error) {
    return (
      <Callout type="error">
        Failed to load input codes{error.status ? ` (status ${error.status})` : ""}. Please refresh to try again.
      </Callout>
    )
  }

  if (state.message) {
    return <Callout type={state.type}>{state.message}</Callout>
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Input Codes</h1>

      <div className="mt-3 text-center flex gap-2 justify-center items-center">
        <button
          className="cursor-pointer text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={handleChangeCodes}
        >
          Update Database
        </button>
      </div>
      {!inputCodes && <Callout type="warning">No input codes yet — add them below and click Update Database.</Callout>}

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="codes" className="flex justify-end w-[15%]">
          Inputs Codes
        </label>
        <textarea
          className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
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
