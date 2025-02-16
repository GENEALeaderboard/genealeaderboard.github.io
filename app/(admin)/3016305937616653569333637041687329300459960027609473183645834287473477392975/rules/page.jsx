"use client"

import axios from "axios"
import React, { useEffect, useState } from "react"
import { generateUUID } from "@/utils/generateUUID"
// import { fetchInputCodes, updateGeneratedCode } from "./actions"
import { calculateCombinations } from "./utils"
// import { Loading } from "@/components/loading/loading"

export default function Page() {
  // const { data: session, status } = useSession()
  const [session, status] = [{}, "loading"]
  const [submission, setSubmission] = useState("")
  const [studies, setStudies] = useState("")
  const [codes, setCodes] = useState([])

  const [codeSize, setCodeSize] = useState(12)
  const [totalCode, setTotalCode] = useState(40)
  const [nteam, setNTeam] = useState(8)
  const [fractionTotalCodes, setFractionTotalCodes] = useState(2)
  const [screenPerStudy, setScreenPerStudy] = useState(20)
  const [totalStudies, setTotalStudies] = useState(1000)
  const [ncheck, setNCheck] = useState(2)

  // Prolific
  const [completionCode, setCompletionCode] = useState("CMTN9LUK")
  const [failCode, setFailCode] = useState("C70GVE95")

  async function fetchData() {
    try {
      const [resInput, resSubmission, resStudies] = await Promise.all([
        axios.get("/api/inputcode"),
        axios.get("/api/submission"),
        axios.get("/api/studies"),
      ])

      setCodes(resInput.data.codes.join(",\n"))
      setTotalCode(resInput.data.codes.length)
      setSubmission(resSubmission.data.submissions)
      setNTeam(resSubmission.data.submissions.length)
      setStudies(resStudies.data.studies)
    } catch (error) {
      console.error(error)
    }
  }
  useEffect(() => {
    fetchData()
  }, [])

  const handleGenerate = async () => {
    const formData = {
      fractionTotalCodes: fractionTotalCodes,
      ncheck: ncheck,
      completionCode: completionCode,
      failCode: failCode,
    }
    const res = await axios.post("/api/generate", formData)
    // setSubmission(JSON.stringify(res.data.videos, null, 2))
    // setCodes(JSON.stringify(res.data.codes, null, 2))
    // setStudies(JSON.stringify(res.data.studies, null, 2))
    console.log("result", res.data)
    const { success, msg, studies, error } = res.data
    if (success) {
      setStudies(studies)
    }
  }

  const randomInputCodes = async () => {
    const randCodes = []
    for (let i = 0; i < totalCode; i++) {
      const code = generateUUID(codeSize)
      randCodes.push(code)
    }
    randCodes.sort()
    setCodes(randCodes)
    // console.log("object", JSON.stringify(randCodes))
  }

  const updateDatabase = async () => {
    // const res = await updateGeneratedCode(codes)
    const res = await axios.post("/api/inputcode", { codes: codes.split(",") })

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

  return (
    <div className="flex flex-col gap-3">
      <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Generate all study screen
      </h1>
      {/* <p className="mt-6 leading-7 first:mt-0">
      </p> */}
      <div className="mt-6 flex flex-col  px-10 gap-4">
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="codesize" className="w-[20%] flex justify-end">
            Input Code Size
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="codesize"
            type="number"
            value={codeSize}
            onChange={(e) => setCodeSize(e.target.value)}
            name="codesize"
          />
        </div>
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="totalcode" className="w-[20%] flex justify-end">
            Total Inputs
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="totalcode"
            type="number"
            value={totalCode}
            onChange={(e) => setTotalCode(e.target.value)}
            name="totalcode"
          />
        </div>
      </div>
      <hr />
      <div className="mt-3 text-center flex gap-2 justify-center items-center">
        <button
          className="text-sm py-2 px-4 border border-gray-800 bg-gray-800 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={randomInputCodes}
        >
          Generate Random Input Codes
        </button>

        <button
          className="text-sm py-2 px-4 border border-blue-500 bg-blue-500 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={updateDatabase}
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
          value={codes}
          onChange={(e) => setCodes(e.target.value)}
        />
      </div>
      <hr />
      <div className="mt-6 flex flex-col  px-10 gap-4">
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="nteam" className="w-[20%] flex text-left">
            Total Submission (Team)
          </label>
          <input
            className="flex-grow min-w-0 disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="nteam"
            type="number"
            disabled={true}
            value={nteam}
            name="nteam"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="submission" className="w-[20%] flex justify-start">
            All Submission
          </label>
          <textarea
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="submission"
            rows="4"
            name="submission"
            value={JSON.stringify(submission, null, 2)}
            onChange={(e) => setSubmission(e.target.value)}
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label
            htmlFor="totalVideo"
            className="w-[20%] flex flex-col justify-center text-left"
          >
            Total Video <br />
            <span className="text-xs">(Submission x Input)</span>
          </label>
          <input
            className="flex-grow min-w-0 appearance-none disabled:bg-gray-200 rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="totalVideo"
            type="number"
            disabled={true}
            value={nteam * totalCode}
            name="totalVideo"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="npairEachInput" className="w-[20%] flex justify-end">
            Pairwise Combinations of Each Input
          </label>
          <input
            className="flex-grow min-w-0 appearance-none  disabled:bg-gray-200 rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="npairEachInput"
            type="number"
            disabled={true}
            value={calculateCombinations(nteam, 2)}
            name="npairEachInput"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="totalScreen" className="w-[20%] flex text-left">
            Total Pairwise Screen
          </label>
          <input
            className="flex-grow min-w-0 appearance-none  disabled:bg-gray-200 rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="totalScreen"
            type="number"
            disabled={true}
            value={calculateCombinations(nteam, 2) * totalCode}
            name="totalScreen"
          />
        </div>

        <hr />
        <div className="flex flex-row items-center gap-4">
          <label
            htmlFor="fractionTotalCodes"
            className="w-[20%] flex flex-col justify-end"
          >
            Fraction of Total Input
            <span className="text-xs">To calculate Screen Per Study</span>
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="fractionTotalCodes"
            type="number"
            value={fractionTotalCodes}
            onChange={(e) => setFractionTotalCodes(e.target.value)}
            name="fractionTotalCodes"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label
            htmlFor="screen_per_studies"
            className="w-[20%] flex flex-col justify-end"
          >
            Screen Per Study
            <span className="text-xs">(Total Input / Fraction)</span>
          </label>
          <input
            className="flex-grow min-w-0 disabled:bg-gray-200  appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="screen_per_studies"
            type="number"
            disabled={true}
            value={totalCode / fractionTotalCodes}
            name="screen_per_studies"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label
            htmlFor="screen_per_studies"
            className="w-[20%] flex text-left"
          >
            Total Studies
          </label>
          <input
            className="flex-grow min-w-0 disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="screen_per_studies"
            type="number"
            disabled={true}
            value={
              (calculateCombinations(nteam, 2) * totalCode) /
              (totalCode / fractionTotalCodes)
            }
            // onChange={(e) => setTotalStudies(e.target.value)}
            readOnly
            name="screen_per_studies"
          />
        </div>

        <hr />
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="ncheck" className="w-[20%] flex text-left">
            Attention Check Per Study
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="ncheck"
            type="number"
            value={ncheck}
            onChange={(e) => setNCheck(e.target.value)}
            name="ncheck"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="npage" className="w-[20%] flex flex-col text-left">
            Total Pages
            <span className="text-xs">(Attention check + Pairwise Screen)</span>
          </label>
          <input
            className="flex-grow min-w-0 disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="npage"
            disabled={true}
            type="number"
            value={
              ((calculateCombinations(nteam, 2) * totalCode) /
                (totalCode / fractionTotalCodes)) *
                ncheck +
              calculateCombinations(nteam, 2) * totalCode
            }
            name="npage"
          />
        </div>

        <hr />
        <div className="flex flex-row items-center gap-4">
          <label htmlFor="completionCode" className="w-[20%] flex text-left">
            Prolific Completion Code
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="completionCode"
            type="string"
            value={completionCode}
            onChange={(e) => setCompletionCode(e.target.value)}
            name="completionCode"
          />
        </div>

        <div className="flex flex-row items-center gap-4">
          <label htmlFor="failCode" className="w-[20%] flex text-left">
            Prolific Fail Code
          </label>
          <input
            className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="failCode"
            type="string"
            value={failCode}
            onChange={(e) => setFailCode(e.target.value)}
            name="failCode"
          />
        </div>
      </div>
      <div className="mt-3 text-center">
        <button
          className="text-sm py-2 px-4 border border-green-500 bg-green-600 text-white contrast-more:text-gray-700 contrast-more:dark:text-gray-100 max-md:hidden whitespace-nowrap subpixel-antialiased hover:underline rounded-md transition-all"
          aria-current="true"
          onClick={handleGenerate}
        >
          Generate All Studies
        </button>
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="studies" className="flex justify-end w-[15%]">
          Studies
        </label>
        <textarea
          className="flex-grow min-w-0 disabled:bg-gray-50 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="studies"
          rows="20"
          disabled={true}
          name="studies"
          value={JSON.stringify(studies, null, 2)}
        />
      </div>
    </div>
  )
}
