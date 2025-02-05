"use client"

import Image from "next/image"
import UploadNPY from "./uploadnpy"
import { useEffect, useState } from "react"
import InputCode from "./inputcode"
import axios from "axios"
import { Loading } from "@/components"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default function Page() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(false)

  async function fetchInputCodes() {
    const res = await axios.get("/api/inputcode")
    console.log("res", res.data.codes)
    if (res.data.success) {
      setCodes(res.data.codes)
    } else {
      console.error(res.error)
    }
  }

  // console.log("codes", codes)

  useEffect(() => {
    setLoading(true)
    fetchInputCodes()
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center ">
        <Loading />
      </div>
    )
  }

  return (
    <>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
        Submission
      </h1>
      {/* <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Download input codes
      </h2>
      {loading && <InputCode codes={codes} />} */}
      <p className="mt-3 leading-7 first:mt-0">
        We provided input speech audio files and you need to generate speech
        gesture motion data for all test inputs. The output motion data should
        be in the format ... (to be updated)
      </p>
      {/* <p className="mt-3 leading-7 first:mt-0">
        Run your model to get inference output
      </p>
      <Image
        width={739}
        height={439}
        alt="Upload page"
        className="w-[70%] mx-auto"
        src="/upload_page.png"
      /> */}
      <p className="mt-3 leading-7 first:mt-0">
        Login with Github and upload your generated NPY files in the section
        below. Please use the same file names of the input files (e.g., TODO:
        add example names). You should upload individual NPY files; do not
        upload a zip file.
      </p>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Upload NPY files
      </h2>
      <div className="mt-6 mb-32">
        {/* <p className="mt-3 leading-7 first:mt-0">Github information</p> */}
        <UploadNPY codes={codes} />
      </div>
    </>
  )
}
