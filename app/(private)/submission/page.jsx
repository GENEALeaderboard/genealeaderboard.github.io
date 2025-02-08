"use client"

import Image from "next/image"
import UploadNPY from "./uploadnpy"
import { useEffect, useState } from "react"
import InputCode from "./inputcode"
import { Loading } from "@/components"
import useSWR from "swr"
import { apiFetcher } from "@/utils/fetcher"
import { useAuth } from "@/contexts/auth"
import { Callout } from "@/nextra"
import { API_ENDPOINT } from "@/config/constants"
import CircleLoading from "@/icons/circleloading"

export default function Page() {
  const { user, status } = useAuth()
  const {
    data: codes,
    error,
    isLoading,
  } = useSWR("/api/inputcode", apiFetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  })

  if (error) {
    return <Callout type="error">Failed to connect, please contact support</Callout>
  }

  return (
    <>
      <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Submission</h1>
      {/* <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Download input codes
      </h2>
      {loading && <InputCode codes={codes} />} */}
      <p className="mt-3 leading-7 first:mt-0">
        We provided input speech audio files and you need to generate speech gesture motion data for all test inputs. The output motion data should be in the format ... (to be
        updated)
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
        Login with Github and upload your generated NPY files in the section below. Please use the same file names of the input files (e.g., TODO: add example names). You should
        upload individual NPY files; do not upload a zip file.
      </p>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Upload NPY files
      </h2>
      <div className="mt-6 mb-32">
        {isLoading || status === "loading" ? (
          <div className="w-full px-12  justify-center">
            <p className="flex justify-center p-4 gap-2">
              <CircleLoading />
              Loading codes...
            </p>
          </div>
        ) : (
          <UploadNPY codes={codes} user={user} status={status} />
        )}
      </div>
    </>
  )
}
