"use client"

import axios from "axios"
import React, { useEffect, useState } from "react"
import { generateUUID } from "@/utils/generateUUID"
import { calculateCombinations } from "./utils"
import { Loading } from "@/components"
// import { Loading } from "@/components/loading/loading"

export default function Page() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchData() {
    try {
      const [resInput, resSubmission, resStudies] = await Promise.all([axios.get("/api/inputcode")])

      setCodes(resInput.data.codes.join(",\n"))
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    setLoading(true)
    fetchData()
    setLoading(false)
  }, [])

  const handleChangeCodes = async () => {
    let inputcodes = codes
      .split(",")
      .map((item) => item.trim())
      .sort()
    // const res = await updateInputCode(inputcodes)
    const res = await axios.get(  "/api/inputcode")

    if (res.success) {
      console.log("Insert new inputs code success", res)
    } else {
      console.log("Insert new inputs code failed", res)
    }
  }

  // if (status === "loading") {
  //   return <Loading></Loading>
  // }

  // if (status === "loading" || status === "unauthenticated") {
  //   return <div>Unauthenticated</div>
  // }
  if (loading) {
    return <Loading></Loading>
  }

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Input Codes</h1>

      <div className="mt-3 text-center flex gap-2 justify-center items-center">
        <button
          className="text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={handleChangeCodes}
        >
          Update Database
        </button>
      </div>
      {codes && (
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="codes" className="flex justify-end w-[15%]">
            Inputs Codes
          </label>
          <textarea
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="codes"
            rows="7"
            name="codes"
            value={codes}
            onChange={(e) => setCodes(e.target.value)}
          />
        </div>
      )}
    </div>
  )
}
