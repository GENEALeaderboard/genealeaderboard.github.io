"use client"

import React, { useEffect, useState, useMemo } from "react"
import cn from "clsx"
import axios from "axios"
import { Loading } from "@/components"
import VideoList from "./VideoList"

export default function Page() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchVideos() {
    setLoading(true)
    const res = await axios.get("/api/videos")
    if (res.data.success) {
      setVideos(res.data.videos)
      setLoading(false)
    } else {
      console.error(res.error)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  const videoList = useMemo(() => videos, [videos])

  return (
    <div>
      <h2 className="font-semibold tracking-tight text-slate-900 dark:text-slate-100 mt-10 border-b pb-1 text-3xl border-neutral-200/70 contrast-more:border-neutral-400 dark:border-primary-100/10 contrast-more:dark:border-neutral-400">
        Videos
      </h2>
      <div
        className={cn(
          "-mx-6 mb-4 mt-6 overflow-x-auto overscroll-x-contain px-6 pb-4 ",
          "mask-gradient"
        )}
      >
        {loading ? (
          <div className="flex w-full p-32 justify-center">
            <Loading />
          </div>
        ) : (
          <VideoList videos={videoList} />
        )}
      </div>
    </div>
  )
}
