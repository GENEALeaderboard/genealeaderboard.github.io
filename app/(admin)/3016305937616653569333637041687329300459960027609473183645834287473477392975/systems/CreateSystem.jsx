"use client"

import { clsx as cn } from "clsx"
import { Callout } from "@/nextra"
import { Description, Field, Label, Select } from "@headlessui/react"
import SubmissionList from "./submissionlist"
import { SYSTEM_TYPES } from "@/config/constants"
import { ArrowLeftIcon } from "@/nextra/icons"
import { Fragment, useEffect, useMemo, useState } from "react"
import { generateUUID } from "@/utils/generateUUID"
import { incrementAlpha } from "./utils"
import { apiPost } from "@/utils/fetcher"

export default function CreateSystem({ submissions, systems }) {
  const [selectedSystem, setSelectedSystem] = useState(0)
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const [systemType, setSystemType] = useState("system")
  const [systemname, setSystemName] = useState("")
  const [description, setDescription] = useState("")
  const lastSystemName = useMemo(() => {
    const systemNames = systems.map((system) => system.name).filter((name) => /^S[A-Z]+$/.test(name))

    const systemSorted = [...new Set(systemNames)].sort()

    const lastSystem = systemSorted.length > 0 ? systemSorted[systemSorted.length - 1] : "S"

    const nextSuffix = incrementAlpha(lastSystem.slice(1))
    return `S${nextSuffix}`
  }, [systems, systemType])
  console.log("lastSystemName", lastSystemName)

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const [state, setState] = useState({ type: "", message: "" })

  const updateSystemType = function updateSystemType(type) {
    setSystemType(type)
    switch (type) {
      case "groundtruth":
        setSystemName("NA")
        setDescription("Ground truth system")
        break
      case "baseline":
        setSystemName("BA")
        setDescription("Baseline System")
        break
      case "system":
        setSystemName(lastSystemName)
        setDescription("System")
        break
      default:
        break
    }
  }

  async function onCreateSystem(e) {
    e.preventDefault()

    try {
      if (submissions.length === 0) {
        setState({ type: "error", message: "No submissions available" })
        return
      }

      let systemID = 0
      if (systemType === "system") {
        systemID = submissions[selectedSystem].id
      }
      const newSystem = {
        name: systemname,
        type: systemType,
        description: description,
        submissionid: systemID,
      }
      console.log("data", newSystem)

      const res = await apiPost("/api/systems", { newSystem: newSystem })
      if (res.success) {
        setState({ type: "info", message: res.msg })
      } else {
        console.log("res", res)
        setState({ type: "error", message: res.msg })
      }
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    updateSystemType(systemType)
  }, [systemType])

  if (state.message) {
    return <Callout type={state.type}>{state.message}</Callout>
  }

  return (
    <div className="">
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Create System
      </h2>
      <form className="mt-2 mb-6 flex flex-col px-4 gap-4" onSubmit={onCreateSystem}>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="systemname" className="w-[20%] flex justify-end">
            System Type
          </label>
          <div className="relative items-center align-middle flex-grow">
            <Select
              name="status"
              value={systemType}
              onChange={(e) => {
                setSystemType(e.target.value)
              }}
              className={cn(
                "w-full appearance-none rounded-md border border-[#666666]  px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
              )}
            >
              {({ focus, hover }) => (
                <Fragment>
                  {SYSTEM_TYPES.map((sysType, index) => (
                    <option
                      key={index}
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
        <SubmissionList systemType={systemType} submissions={submissions} setSelectedSystem={setSelectedSystem} />

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="systemname" className="w-[20%] flex justify-end">
            System Name
          </label>
          <input
            className="flex-grow disabled bg-gray-200 min-w-0 appearance-none rounded-md border border-[#666666]  px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark: dark:focus:border-white sm:text-sm"
            id="systemname"
            type="text"
            disabled
            name="systemname"
            value={systemname}
            onChange={(e) => setSystemName(e.target.value)}
          />
        </div>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="upload" className="w-[20%] flex justify-end">
            Description
          </label>

          <textarea
            tabIndex="0"
            className="w-[80%] p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark: dark:focus:border-white sm:text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>
        <div className="flex flex-col items-center">
          <div className="pl-[20%] flex justify-start">
            <button className="cursor-pointer flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent text-white bg-black px-4 py-2 text-base font-bold  focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all">
              Create System
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
