"use client"

import Image from "next/image"
import UploadMismatchVideos from "./uploadmismatchvideos"
import { useEffect, useState } from "react"
// import fetchInputCodes from "./actions"
import InputCode from "./inputcode"
import axios from "axios"
import { Loading } from "@/components"

export default function Page() {
  // const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [teams, setTeams] = useState([])

  // async function fetchInputCodes() {
  //   setLoading(false)
  //   const res = await axios.get("/api/inputcode")
  //   if (res.data.success) {
  //     setCodes(res.data.codes)
  //     setLoading(true)
  //   } else {
  //     console.error(res.error)
  //   }
  // }
  async function fetchTeams() {
    const res = await axios.get("/api/submission")
    if (res.data.success) {
      setTeams(res.data.submissions)
    } else {
      console.error(res.error)
    }
  }

  useEffect(() => {
    fetchTeams()
    // fetchInputCodes()
  }, [])

  return (
    <>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Upload Mismath Videos
      </h2>
      <div className="mt-6 mb-32">
        {/* <p className="mt-3 leading-7 first:mt-0">Github information</p> */}
        {loading && teams.length > 0 ? (
          // <UploadVideos codes={codes} teams={teams} />
          <UploadMismatchVideos teams={teams} />
        ) : (
          <div className="text-center">
            <Loading />
          </div>
        )}
      </div>
    </>
  )
}
