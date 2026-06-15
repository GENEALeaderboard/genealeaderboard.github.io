"use client"

import { Fragment, useEffect, useState } from "react"
import Image from "next/image"
import { clsx as cn } from "clsx"
import axios from "axios"
import useSWR from "swr"
import { Callout } from "@/nextra"
import { Loading } from "@/components"
import { Select } from "@headlessui/react"
import { ArrowLeftIcon } from "@/nextra/icons"
import { API_ENDPOINT, N_ATTENTION_CHECK_PER_STUDY, STUDY_KEYS, STUDY_TYPES } from "@/config/constants"
import CSVPreviewer from "./CSVPreviewer"
import UploadBox from "./UploadBox"
import CircleLoading from "@/icons/circleloading"
import { apiPost, apiPatch, apiFetcherData, apiFetcher } from "@/utils/fetcher"
import AttentionCheckList from "./AttentionCheckList"
import { generatePairwiseHumanlikness } from "./generatePairwiseHumanlikness"
import { generateMismatchSpeech } from "./generateMismatchSpeech"
import { generateMismatchEmotion } from "./generateMismatchEmotion"
import { generatePairwiseEmotion } from "./generatePairwiseEmotion"
import { generateSeamlessHumanlikeness } from "./generateSeamlessHumanlikeness"
import { generateSeamlessSpeechMismatch } from "./generateSeamlessSpeechMismatch"
import { generateSeamlessDyadicMismatch } from "./generateSeamlessDyadicMismatch"
import { generateSeamlessSemanticMismatch } from "./generateSeamlessSemanticMismatch"

const SEAMLESS_STUDY_KEYS = new Set([
  "seamless-humanlikeness",
  "seamless-speech-mismatch",
  "seamless-dyadic-mismatch",
  "seamless-semantic-mismatch",
])

export default function Page() {
  const [csvList, setCsvList] = useState([])
  const [loadedCSV, setLoadedCSV] = useState(false)
  const [keyStd, setStudyType] = useState(STUDY_KEYS[0])
  const [isValid, setIsValid] = useState(false)
  const [genState, setGenState] = useState({ type: "", msg: null })
  const [validState, setValidState] = useState({ type: "loading", msg: null })

  // ******************************************************
  // Attention checks live in a per-study category. Seamless studies each have
  // their own pool; everything else uses "origin". Hardcoding "origin" here made
  // seamless study generation report "no attention checks".
  const SEAMLESS_ATTENTION_CATEGORY = {
    seamlessHumanLikeness: "seamless-origin-humanlikeness",
    seamlessSpeechMismatch: "seamless-speech-mismatch",
    seamlessDyadicMismatch: "seamless-dyadic-mismatch",
    seamlessSemanticMismatch: "seamless-semantic-mismatch",
  }
  const attentionCategory = SEAMLESS_ATTENTION_CATEGORY[keyStd] || "origin"
  const {
    data: attentionCheckList,
    error: isError,
    isLoading,
  } = useSWR(`/api/attention-check?category=${attentionCategory}`, apiFetcherData, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })
  // ******************************************************

  const handleValidate = async (e) => {
    e.preventDefault()
    try {
      window.scrollTo({ top: 0 })
      let isAllValid = true

      const studyKey = STUDY_TYPES[keyStd].key

      for (let i = 0; i < csvList.length; i++) {
        const { data, filename } = csvList[i]
        // Update state to indicate validation is in progress
        setCsvList((prevList) => prevList.map((item, index) => (index === i ? { ...item, state: "loading" } : item)))

        const res = await apiPatch(`/api/${studyKey}`, { csv: data.slice(1) })
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
      const studyKey = STUDY_TYPES[keyStd].key
      const studyVideoType = STUDY_TYPES[keyStd].type

      const configs = await apiFetcherData(`/api/configs?type=${studyKey}`)
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

      const studiesCSV = Array.from(csvList).map((csv) => csv.data.slice(1))
      const videoOrigins = videos.filter((video) => video.type === "origin")
      // Use array indices as temporary study IDs; real IDs are patched in after
      // study insertion so that a generation failure never touches the DB.
      const tempIds = studiesCSV.map((_, i) => i)

      let pageList = []
      switch (studyKey) {
        case "pairwise-humanlikeness":
          pageList = generatePairwiseHumanlikness(studiesCSV, videoOrigins, tempIds, studyConfig, attentionCheckList)
          break
        case "pairwise-emotion":
          pageList = generatePairwiseEmotion(studiesCSV, videos, tempIds, studyConfig, attentionCheckList)
          break
        case "mismatch-speech": {
          const videoMismatch = videos.filter((video) => video.type === "mismatch-speech")
          pageList = generateMismatchSpeech(studiesCSV, videoOrigins, videoMismatch, tempIds, studyConfig, attentionCheckList)
          break
        }
        case "mismatch-emotion":
          pageList = generateMismatchEmotion(studiesCSV, videos, tempIds, studyConfig, attentionCheckList)
          break
        case "seamless-humanlikeness": {
          const videoSeamless = videos.filter((video) => video.type === "seamless-origin-humanlikeness")
          pageList = generateSeamlessHumanlikeness(studiesCSV, videoSeamless, tempIds, studyConfig, attentionCheckList)
          break
        }
        case "seamless-speech-mismatch": {
          const videoSeamlessSpeechOrigin = videos.filter((v) => v.type === "seamless-speech-mismatch/matched")
          const videoSeamlessSpeechMismatch = videos.filter((v) => v.type === "seamless-speech-mismatch/mismatched")
          pageList = generateSeamlessSpeechMismatch(studiesCSV, videoSeamlessSpeechOrigin, videoSeamlessSpeechMismatch, tempIds, studyConfig, attentionCheckList)
          break
        }
        case "seamless-dyadic-mismatch": {
          const videoDyadicOrigin = videos.filter((v) => v.type === "seamless-dyadic-mismatch/matched")
          const videoDyadicMismatch = videos.filter((v) => v.type === "seamless-dyadic-mismatch/mismatched")
          pageList = generateSeamlessDyadicMismatch(studiesCSV, videoDyadicOrigin, videoDyadicMismatch, tempIds, studyConfig, attentionCheckList)
          break
        }
        case "seamless-semantic-mismatch": {
          const videoSemantic = videos.filter((v) => v.type === "seamless-semantic-origin")
          pageList = await generateSeamlessSemanticMismatch(studiesCSV, videoSemantic, tempIds, studyConfig, attentionCheckList)
          break
        }
        default:
          break
      }

      if (!pageList || pageList.length === 0) {
        setGenState({ type: "error", msg: "Failed to generate screen study" })
        return
      }

      // Generation succeeded — now persist studies and get real IDs.
      const studies = csvList.map((item) => ({
        status: "new",
        name: studyConfig.name,
        time_start: new Date(),
        type: studyKey,
        global_actions: JSON.stringify([]),
        file_created: item.filename,
        prolific_sessionid: "",
        prolific_studyid: "",
        prolific_userid: "",
        completion_code: studyConfig.completion_code,
        fail_code: studyConfig.fail_code,
      }))

      const respStudies = await apiPost(`/api/studies`, { studies })
      if (!respStudies.success) {
        setGenState({ type: "error", msg: respStudies.msg })
        return
      }

      const studiesID = respStudies.data
      if (studiesCSV.length !== studiesID.length) {
        setGenState({ type: "error", msg: "Studies result not match" })
        return
      }

      // Swap temp indices for real DB IDs before inserting pages.
      const patchedPageList = pageList.map((page) => ({ ...page, studyid: studiesID[page.studyid] }))

      const respPages = await apiPost(`/api/pages`, { pages: patchedPageList })
      if (!respPages.success) {
        setGenState({ type: "error", msg: respPages.msg })
        return
      }

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
        Attention Check
      </h2>

      <div className={cn("-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4 ", "mask-gradient")}>
        <AttentionCheckList attentionCheckList={attentionCheckList} />
      </div>
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
                    value={keyStd}
                    onChange={(e) => {
                      setStudyType(e.target.value)
                    }}
                    className={cn(
                      "w-full appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
                    )}
                  >
                    {({ focus, hover }) => (
                      <Fragment>
                        {Object.entries(STUDY_TYPES).filter(([, sysType]) => !SEAMLESS_STUDY_KEYS.has(sysType.key)).map(([key, sysType]) => (
                          <option
                            key={key}
                            className="text-gray-800 dark:text-gray-100 relative cursor-pointer whitespace-nowrap py-1.5 transition-colors ltr:pl-3 ltr:pr-9 rtl:pr-3 rtl:pl-9"
                            value={key}
                          >
                            {sysType.label}
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
                    className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
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
