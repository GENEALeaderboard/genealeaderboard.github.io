"use client"

import React, { useEffect, useState } from "react"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcherData, apiPatch } from "@/utils/fetcher"
import { Callout } from "@/nextra"

const INPUTCODE_TYPES = [
  { value: "origin", label: "Origin (Pairwise / Mismatch)" },
  { value: "seamless-origin-humanlikeness", label: "Seamless Human-Likeness" },
]

export default function Page() {
  const [inputcodeType, setInputcodeType] = useState(INPUTCODE_TYPES[0].value)

  const {
    data: codes,
    error,
    isLoading: loading,
  } = useSWR(`/api/inputcode?type=${inputcodeType}`, apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  const [inputCodes, setInputCodes] = useState("")
  const [state, setState] = useState({ type: "", message: null })

  useEffect(() => {
    if (codes) {
      console.log("data", codes)
      setInputCodes(codes.join(",\n"))
    } else {
      setInputCodes("")
    }
  }, [codes])

  const handleChangeCodes = async () => {
    const codeList = inputCodes.replace(/\n/g, "")
    const res = await apiPatch("/api/inputcode", { codes: codeList, type: inputcodeType })

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

  if (state.message) {
    return <Callout type={state.type}>{state.message}</Callout>
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Input Codes</h1>

      <div className="flex flex-row items-center gap-4 mt-4">
        <label className="flex justify-end w-[15%]">Video Type</label>
        <div className="flex-grow flex items-center gap-6">
          {INPUTCODE_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="inputcodeType"
                value={opt.value}
                checked={inputcodeType === opt.value}
                onChange={(e) => setInputcodeType(e.target.value)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-3 text-center flex gap-2 justify-center items-center">
        <button
          className="cursor-pointer text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={handleChangeCodes}
        >
          Update Database
        </button>
      </div>
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
