"use client"

import { Fragment, useEffect, useState } from "react"
import Image from "next/image"
import { clsx as cn } from "clsx"
import axios from "axios"

import { Callout } from "@/nextra"
import { Loading } from "@/components"
import { Select } from "@headlessui/react"
import { ArrowLeftIcon } from "@/nextra/icons"
import { API_ENDPOINT, SYSTEM_TYPES } from "@/config/constants"
import CSVPreviewer from "./CSVPreviewer"
import UploadBox from "./UploadBox"
import CircleLoading from "@/icons/circleloading"
import { apiInsert, apiPatch } from "@/utils/fetcher"

export default function Page() {
  const [csvList, setCsvList] = useState([])
  const [loadedCSV, setLoadedCSV] = useState(false)
  const [systemType, setSystemType] = useState(Object.keys(SYSTEM_TYPES)[0])
  const [isValid, setIsValid] = useState(false)
  const [genState, setGenState] = useState("")
  const [state, setState] = useState({ type: "loading", msg: "" })

  // if (loading) {
  //   return (
  //     <div className="text-center">
  //       <Loading />
  //     </div>
  //   )
  // }

  const handleValidate = async (e) => {
    e.preventDefault()
    try {
      window.scrollTo({ top: 0 })
      let isAllValid = true

      for (let i = 0; i < csvList.length; i++) {
        const { data, filename } = csvList[i]

        // Update state to indicate validation is in progress
        setCsvList((prevList) => prevList.map((item, index) => (index === i ? { ...item, state: "loading" } : item)))

        const res = await apiPatch(`/api/${systemType}`, { csv: data.slice(1) })
        console.log("res", res)
        if (!res.success) {
          console.log("res", res)
          setState({ type: "error", msg: res.msg })
          isAllValid = false
        }

        setCsvList((prevList) =>
          prevList.map((item, index) =>
            index === i
              ? {
                  ...item,
                  state: res.success ? "success" : "error",
                  errorMsg: res.success ? "" : res.msg,
                }
              : item
          )
        )

        document.getElementById(`csv-previewer-${i}`).scrollIntoView()

        if (isAllValid === false) {
          break
        }
      }
      setIsValid(isAllValid)
    } catch (error) {
      console.error("Validation error:", error)
      setCsvList((prevList) =>
        prevList.map((item, index) =>
          index === i
            ? {
                ...item,
                state: "error",
                errorMsg: error.response?.data?.msg || "Unknown error occurred",
              }
            : item
        )
      )
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    try {
      setGenState("loading")

      const url = `${API_ENDPOINT}/api/${systemType}`

      const studiesCSV = Array.from(csvList).map((csv) => csv.data.slice(1))
      const resp = apiInsert(url, {
        systemType: systemType,
        studiesCSV: studiesCSV,
      })
      const { success, msg, error } = resp

      if (success) {
        setGenState("success")
      } else {
        setGenState("Please contact support")
      }
    } catch (error) {
      console.log("error", error)
      setGenState("Please contact support")
    }

    // if (files.length <= 0) {
    //   setErrorMsg("Please upload video")
    //   return
    // }

    // try {
    //   setUploading("Uploading your videos, please waiting ...")

    //   const uploadPromises = Array.from(files).map((file) => {
    //     return uploadPromise(file, (fileName, percent) => {
    //       setProgress((prevProgress) => {
    //         // console.log("prevProgress", prevProgress)
    //         return {
    //           ...prevProgress,
    //           [fileName]: percent,
    //         }
    //       })
    //     })
    //   })

    //   const results = await Promise.all(uploadPromises)
    //   // console.log("results", results)
    //   const allSuccessful = results.every((result) => result.success)
    //   if (allSuccessful) {
    //     const { success, msg, error } = results.at(-1)
    //     setSuccess(msg)
    //     console.log("Success", success, "msg", msg, "error", error)
    //   } else {
    //     const failedResult = results.filter((result) => !result.success)[0]
    //     const { success, msg, error } = failedResult
    //     setErrorMsg(msg)
    //     console.log("Success", success, "msg", msg, "error", error)
    //   }
    // } catch (error) {
    //   console.log("EXCEPTION ", error)
    //   setErrorMsg(
    //     "EXCEPTION: Error with uploading your videos, please contact support"
    //   )
    //   console.log("Exception", error)
    // } finally {
    //   setUploading("")
    // }
  }

  if (genState) {
    if (genState === "loading") {
      return (
        <div className="w-full px-12  justify-center">
          <p className="flex justify-center p-4 gap-2">
            <CircleLoading />
            Generating...
          </p>
        </div>
      )
    } else if (genState === "success") {
      return (
        <div className="w-full p-12 justify-center ">
          <Callout type="info" className="mt-0">
            Your studies are generated successfully.
          </Callout>
        </div>
      )
    } else {
      return (
        <div className="w-full p-12 justify-center ">
          <Callout type="error" className="mt-0">
            {genState}
          </Callout>
        </div>
      )
    }
  }

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Upload CSV Studies
      </h2>
      <div className="mt-6 mb-32">
        {/* <p className="mt-3 leading-7 first:mt-0">Github information</p> */}
        <form className="mt-6 flex flex-col gap-4">
          <UploadBox setCsvList={setCsvList} loadedCSV={loadedCSV} setLoadedCSV={setLoadedCSV} />

          <div className="flex flex-col py-4 gap-4">
            {csvList.map(({ data, filename, state, errorMsg }, index) => {
              return <CSVPreviewer key={index} index={index} data={data} filename={filename} state={state} errorMsg={errorMsg} />
            })}
          </div>
          {loadedCSV && (
            <div className="flex flex-col gap-4">
              {/* ********************************************************************************** */}
              <div className="flex flex-row items-center gap-4">
                <label htmlFor="studytype" className="w-[20%] flex justify-end">
                  Study Type
                </label>
                <div className="relative items-center align-middle flex-grow">
                  <Select
                    name="status"
                    id="studytype"
                    value={systemType}
                    onChange={(e) => {
                      setSystemType(e.target.value)
                    }}
                    className={cn(
                      "w-full appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
                    )}
                  >
                    {({ focus, hover }) => (
                      <Fragment>
                        {Object.entries(SYSTEM_TYPES).map(([key, sysType]) => (
                          <option
                            key={key}
                            className="text-gray-800 dark:text-gray-100 relative cursor-pointer whitespace-nowrap py-1.5 transition-colors ltr:pl-3 ltr:pr-9 rtl:pr-3 rtl:pl-9"
                            value={sysType}
                          >
                            {sysType}
                          </option>
                        ))}
                      </Fragment>
                    )}
                  </Select>
                  <ArrowLeftIcon className="pointer-events-none absolute top-2.5 right-2.5 size-5  ltr:rotate-90" aria-hidden="true" />
                </div>
              </div>
              {/* ********************************************************************************** */}
              {state.msg ? (
                <Callout type={state.type} className="mt-0">
                  {state.msg}
                </Callout>
              ) : (
                <> </>
              )}

              <div className="flex flex-col gap-8 mt-4 items-center">
                {isValid ? (
                  <button
                    className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-black px-4 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
                    onClick={handleUpload}
                  >
                    Generate Study
                  </button>
                ) : (
                  <button
                    className="flex cursor-pointer h-10 items-center gap-2 w-44 betterhover:hover:bg-green-600 dark:betterhover:hover:bg-green-300 justify-center rounded-md border border-transparent bg-green-500 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-600 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm transition-all"
                    onClick={handleValidate}
                  >
                    Validate CSV
                  </button>
                )}
              </div>
            </div>
          )}
        </form>
      </div>
    </>
  )
}
