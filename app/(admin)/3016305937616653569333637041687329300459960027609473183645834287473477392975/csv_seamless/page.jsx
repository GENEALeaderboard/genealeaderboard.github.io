"use client"

import { useState } from "react"
import { clsx as cn } from "clsx"
import useSWR from "swr"
import { Callout } from "@/nextra"
import CSVPreviewer from "../csv/CSVPreviewer"
import UploadBox from "../csv/UploadBox"
import CircleLoading from "@/icons/circleloading"
import { apiPost, apiPatch, apiFetcherData } from "@/utils/fetcher"
import AttentionCheckList from "../csv/AttentionCheckList"
import { generateSeamlessHumanlikeness } from "../csv/generateSeamlessHumanlikeness"

const STUDY_KEY = "seamless-humanlikeness"
const VIDEO_TYPE = "seamless-origin-humanlikeness"

export default function Page() {
  const [csvList, setCsvList] = useState([])
  const [loadedCSV, setLoadedCSV] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [genState, setGenState] = useState({ type: "", msg: null })
  const [validState, setValidState] = useState({ type: "loading", msg: null })

  const { data: attentionCheckList } = useSWR("/api/attention-check", apiFetcherData, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  const handleValidate = async (e) => {
    e.preventDefault()
    try {
      window.scrollTo({ top: 0 })
      let isAllValid = true

      for (let i = 0; i < csvList.length; i++) {
        const { data } = csvList[i]
        setCsvList((prevList) => prevList.map((item, index) => (index === i ? { ...item, state: "loading" } : item)))

        const res = await apiPatch(`/api/${STUDY_KEY}`, { csv: data.slice(1) })
        if (!res.success) {
          setValidState({ type: "error", msg: res.msg })
          isAllValid = false
        }
        setCsvList((prevList) =>
          prevList.map((item, index) =>
            index === i
              ? { ...item, state: res.success ? "success" : "error", errorMsg: res.success ? "" : res.msg }
              : item
          )
        )

        document.getElementById(`csv-previewer-${i}`)?.scrollIntoView()

        if (!isAllValid) break
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

      const configs = await apiFetcherData(`/api/configs?type=${STUDY_KEY}`)
      const studyConfig = configs[0]
      if (!studyConfig) {
        setGenState({ type: "error", msg: "Study configuration not found" })
        return
      }

      const videos = await apiFetcherData(`/api/videos`)
      if (!videos) {
        setGenState({ type: "error", msg: "Videos not found" })
        return
      }

      const studies = csvList.map((item) => ({
        status: "new",
        name: studyConfig.name,
        time_start: new Date(),
        type: STUDY_KEY,
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
      const studiesCSV = Array.from(csvList).map((csv) => csv.data.slice(1))
      if (studiesCSV.length !== studiesID.length) {
        setGenState({ type: "error", msg: "Studies result not match" })
        return
      }

      const videoSeamless = videos.filter((video) => video.type === VIDEO_TYPE)
      const pageList = generateSeamlessHumanlikeness(studiesCSV, videoSeamless, studiesID, studyConfig, attentionCheckList)

      if (!pageList || pageList.length === 0) {
        setGenState({ type: "error", msg: "Failed to generate screen study" })
        return
      }

      const respPages = await apiPost(`/api/pages`, { pages: pageList })
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
        <div className="w-full px-12 justify-center">
          <p className="flex justify-center p-4 gap-2">
            <CircleLoading />
            Generating...
          </p>
        </div>
      )
    }
    return (
      <div className="w-full p-12 justify-center">
        <Callout type={genState.type} className="mt-0">
          {genState.msg}
        </Callout>
      </div>
    )
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
        Upload Seamless CSV Studies
      </h2>
      <p className="mt-3 text-sm text-gray-500">Study type is fixed to <code>{STUDY_KEY}</code>. Videos are pulled from the <code>{VIDEO_TYPE}</code> pool.</p>

      <div className="mt-6 mb-32">
        <form className="mt-6 flex flex-col gap-4">
          <UploadBox setCsvList={setCsvList} loadedCSV={loadedCSV} setLoadedCSV={setLoadedCSV} />

          <div className="flex flex-col py-4 gap-4">
            {csvList.map(({ data, filename, state, errorMsg }, index) => (
              <CSVPreviewer key={index} index={index} data={data} filename={filename} state={state} errorMsg={errorMsg} />
            ))}
          </div>
          {loadedCSV && (
            <div className="flex flex-col gap-4">
              {validState.type === "success" && (
                <Callout type="info" className="mt-0">
                  {validState.msg}
                </Callout>
              )}

              <div className="flex flex-col gap-8 mt-4 items-center">
                {isValid ? (
                  <button
                    className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-lg font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm transition-all"
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
