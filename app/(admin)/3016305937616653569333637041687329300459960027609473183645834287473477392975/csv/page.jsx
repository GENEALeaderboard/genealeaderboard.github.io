"use client"

import { Fragment, useEffect, useState } from "react"
import Image from "next/image"
import { clsx as cn } from "clsx"
import axios from "axios"

import { Callout } from "@/nextra"
import { Loading } from "@/components"
import { Select } from "@headlessui/react"
import { ArrowLeftIcon } from "@/nextra/icons"
import { API_ENDPOINT, STUDY_TYPES } from "@/config/constants"
import CSVPreviewer from "./CSVPreviewer"
import UploadBox from "./UploadBox"
import CircleLoading from "@/icons/circleloading"
import { apiPost, apiPatch, apiFetcherData, apiFetcher } from "@/utils/fetcher"

export default function Page() {
  const [csvList, setCsvList] = useState([])
  const [loadedCSV, setLoadedCSV] = useState(false)
  const [studyType, setStudyType] = useState(Object.keys(STUDY_TYPES)[0])
  const [isValid, setIsValid] = useState(false)
  const [genState, setGenState] = useState({ type: "", msg: null })
  const [validState, setValidState] = useState({ type: "loading", msg: null })

  const handleValidate = async (e) => {
    e.preventDefault()
    try {
      window.scrollTo({ top: 0 })
      let isAllValid = true

      for (let i = 0; i < csvList.length; i++) {
        const { data, filename } = csvList[i]

        // Update state to indicate validation is in progress
        setCsvList((prevList) => prevList.map((item, index) => (index === i ? { ...item, state: "loading" } : item)))

        const res = await apiPatch(`/api/${studyType}`, { csv: data.slice(1) })
        if (!res.success) {
          console.log("res", res)
          setValidState({ type: "error", msg: res.msg })
          isAllValid = false
        }
        console.log("res", res)
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
      if (isAllValid) {
        setValidState({ type: "success", msg: "Validate success, continue with generate studies" })
      }
    } catch (error) {
      console.error("Validation error:", error)
      setValidState({ type: "error", msg: "Exception of validation error" })
    }
  }
  const handleUpload = async (e) => {
    e.preventDefault()

    try {
      setGenState({ type: "loading", msg: null })

      const configs = await apiFetcherData(`/api/configs?type=${studyType}`)
      const studyConfig = configs[0]
      if (!studyConfig) {
        console.log("studyConfig", studyConfig)
        setGenState({ type: "error", msg: "Study configuration not found" })
        return
      }

      const videos = await apiFetcherData(`/api/videos`)
      if (!videos) {
        console.log("videos", videos)
        setGenState({ type: "error", msg: "Videos not found" })
        return
      }
      const studies = csvList.map((item) => {
        return {
          status: "new",
          name: studyConfig.name,
          time_start: new Date(),
          type: studyType,
          global_actions: JSON.stringify([]),
          file_created: item.filename,
          prolific_sessionid: "",
          prolific_studyid: "",
          prolific_userid: "",
          completion_code: studyConfig.completion_code,
          fail_code: studyConfig.fail_code,
        }
      })
      console.log("studies", studies)

      const respStudies = await apiPost(`/api/studies`, { studies: studies })
      if (!respStudies.success) {
        console.log("respStudies", respStudies)
        setGenState({ type: "error", msg: respStudies.msg })
        return
      }

      const studiesID = respStudies.data
      const studiesCSV = Array.from(csvList).map((csv) => csv.data.slice(1))
      if (studiesCSV.length !== studiesID.length) {
        console.log("studyData", studyData, "studiesID", studiesID)
        setGenState({ type: "error", msg: "Studies result not match" })
        return
      }

      const pageList = []
      studiesCSV.forEach((studyData, stdIndex) => {
        studyData.forEach((row, rowIndex) => {
          const inputcode = row[0]
          const sysA = String(row[1]).trim()
          const sysB = String(row[2]).trim()

          const videoFilteredA = Array.from(videos).filter((video) => video.inputcode === inputcode && video.systemname === sysA)
          const videoFilteredB = Array.from(videos).filter((video) => video.inputcode === inputcode && video.systemname === sysB)
          const videoA = videoFilteredA[0]
          const videoB = videoFilteredB[0]

          console.log("videoA", videoA, "videoB", videoB)
          if (!videoA || !videoB) {
            console.log("videoA", videoA, "videoB", videoB)
            setGenState({ type: "error", msg: `Video not found for ${inputcode} ${sysA} ${sysB}` })
            return
          }

          if (videoA.length === 0 || videoB.length === 0) {
            console.log("videoA", videoA, "videoB", videoB)
            setGenState({ type: "error", msg: `Video not found for ${inputcode} ${sysA} ${sysB}` })
            return
          }

          pageList.push({
            type: "video",
            name: `Page ${rowIndex + 1} of ${studyData.length}`,
            question: studyConfig.question,
            selected: JSON.stringify({}),
            actions: JSON.stringify([]),
            options: JSON.stringify(studyConfig.options),
            system1: sysA,
            system2: sysB,
            video1: videoA.id,
            video2: videoB.id,
            studyid: studiesID[stdIndex],
          })
        })
      })

      const respPages = await apiPost(`/api/pages`, { pages: pageList })

      if (!respPages.success) {
        console.log("respPages", respPages)
        setGenState({ type: "error", msg: respPages.msg })
        return
      }

      console.log("respPages", respPages)

      setGenState({ type: "info", msg: respPages.msg })
    } catch (error) {
      console.log("error", error)
      setGenState({ type: "error", msg: "Exception on upload, please contact support" })
    }
  }

  if (genState.msg) {
    if (genState.type === "loading") {
      return (
        <div className="w-full px-12  justify-center">
          <p className="flex justify-center p-4 gap-2">
            <CircleLoading />
            Generating...
          </p>
        </div>
      )
    } else {
      return (
        <div className="w-full p-12 justify-center ">
          <Callout type={genState.type} className="mt-0">
            {genState.msg}
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
                    value={studyType}
                    onChange={(e) => {
                      setStudyType(e.target.value)
                    }}
                    className={cn(
                      "w-full appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
                    )}
                  >
                    {({ focus, hover }) => (
                      <Fragment>
                        {Object.entries(STUDY_TYPES).map(([key, sysType]) => (
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
              {validState.type === "success" ? (
                <Callout type="info" className="mt-0">
                  {validState.msg}
                </Callout>
              ) : (
                <></>
              )}

              <div className="flex flex-col gap-8 mt-4 items-center">
                {isValid ? (
                  <button
                    className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-primary-500 px-4 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
                    disabled={genState.type === "loading"}
                    onClick={handleUpload}
                  >
                    {genState.type === "loading" ? <CircleLoading className="w-8 h-8" /> : <></>}
                    Generate Study
                  </button>
                ) : (
                  <button
                    className="flex cursor-pointer h-10 items-center gap-2 w-44 betterhover:hover:bg-green-600 dark:betterhover:hover:bg-green-300 justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-green-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm transition-all"
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
