"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Callout } from "@/nextra"
import axios from "axios"
import SystemList from "../upload_origin/systemlist"
import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import CircleLoading from "@/icons/circleloading"
import UploadPreviewer from "../upload_origin/UploadPreviewer"
import { apiPost } from "@/utils/fetcher"

const DEFAULT_VIDEO_TYPE = "seamless-origin-humanlikeness"

export default function UploadSeamlessVideos({ systems, videosLoading, videoType, allowText = false }) {
  const VIDEO_TYPE = videoType || DEFAULT_VIDEO_TYPE
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [validMsg, setValidMsg] = useState("")
  const [uploading, setUploading] = useState("")
  const [progress, setProgress] = useState({})
  const [uploadState, setUploadState] = useState({ type: "", message: "" })
  const [description, setDescription] = useState("")

  const onDrop = useCallback(async (acceptedFiles) => {
    setValidMsg("")
    setUploading("")

    for (let droppedFile of acceptedFiles) {
      const isMp4 = droppedFile.name.toLowerCase().endsWith(".mp4")
      const isTxt = droppedFile.name.toLowerCase().endsWith(".txt")
      if (!isMp4 && !(allowText && isTxt)) {
        setValidMsg(allowText ? "Please upload only .mp4 or .txt files" : "Please upload only .mp4 files")
        return
      }

      if (droppedFile.size > 100 * 1024 * 1024) {
        setValidMsg("File size is too large, please upload file less than 100MB")
        return
      }
    }

    setFiles(acceptedFiles)
    setProgress(
      Array.from(acceptedFiles).reduce((progressItems, fileItem) => {
        progressItems[fileItem.name] = { percent: 0, status: "pending" }
        return progressItems
      }, {})
    )

    const selectedFiles = Array.from(acceptedFiles).map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }))
    setPreviews(selectedFiles)
    setUploading("")
  }, [allowText])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  useEffect(() => {
    if (systems && systems.length > 0) {
      setDescription(systems[selectedIndex].description)
    }
  }, [selectedIndex, systems])

  useEffect(() => {
    setSelectedIndex(0)
  }, [systems])

  const setUploadProgress = useCallback((fileName, percent, status) => {
    setProgress((prevProgress) => ({
      ...prevProgress,
      [fileName]: { percent, status },
    }))
  }, [])

  const simpleUploadFile = async (file, index, systemname) => {
    const fileName = file.name
    const fileSize = file.size

    try {
      setUploadProgress(fileName, 0, "uploading")
      const VIDEO_UPLOAD_URL = `${UPLOAD_API_ENDPOINT}/upload/videos`

      const { data: responseUpload } = await axios.post(
        VIDEO_UPLOAD_URL,
        {
          systemname,
          fileName,
          fileSize,
          file,
          videoType: VIDEO_TYPE,
        },
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? 1))
            setUploadProgress(fileName, percentCompleted, "uploading")
          },
        }
      )

      setUploadProgress(fileName, 100, "completed")
      return responseUpload.data
    } catch (err) {
      console.error("Error uploading file:", err)
      setUploadProgress(fileName, 0, "error")
      const { success, msg, error } = err.response.data
      return { success, msg, error }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (files.length <= 0) {
      setValidMsg("Please upload video")
      return
    }

    const systemname = systems[selectedIndex].name
    if (!systemname) {
      setValidMsg("System selected not found")
      return
    }

    try {
      setUploading("Uploading your videos, please waiting ...")
      setUploadState({ type: "loading", message: "" })

      const videoMeta = []
      for (let index = 0; index < files.length; index++) {
        const reponse = await simpleUploadFile(files[index], index, systemname)
        const { path, inputcode, url } = reponse

        if (!reponse) {
          setUploadState({ type: "error", message: reponse.msg })
          return
        }
        // Only .mp4 files become `videos` rows; .txt descriptions are stored in
        // R2 only (the CSV is the source of truth for the text shown to raters).
        const isVideo = files[index].name.toLowerCase().endsWith(".mp4")
        videoMeta.push({ path, inputcode, url, isVideo })
      }

      const videoDatas = videoMeta
        .filter((meta) => meta.isVideo)
        .map((meta) => ({
          inputcode: meta.inputcode,
          systemname: systems[selectedIndex].name,
          path: meta.path,
          url: meta.url,
          systemid: systems[selectedIndex].id,
          type: VIDEO_TYPE,
        }))

      if (videoDatas.length === 0) {
        // Text-only upload: nothing to record in the videos table.
        setUploadState({ type: "info", message: "Text description files uploaded successfully." })
        return
      }

      setUploading("Uploading your videos to database, please waiting ...")
      const resInsert = await apiPost("/api/videos", { videos: videoDatas })

      if (resInsert.success) {
        setUploadState({ type: "info", message: resInsert.msg })
      } else {
        setUploadState({ type: "error", message: resInsert.msg })
      }
    } catch (error) {
      setUploadState({ type: "error", message: "Error with your upload video, please contact for support!" })
      console.log("EXCEPTION", error)
    } finally {
      setUploading("")
    }
  }

  if (videosLoading) {
    return (
      <div className="w-full px-12 justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  if (!systems || systems.length <= 0) {
    return <Callout type="error">Failed to connect, please contact support</Callout>
  }

  if (uploadState.message) {
    return (
      <div className="w-full p-12 justify-center">
        <Callout type={uploadState.type} className="mt-0">
          {uploadState.message}
        </Callout>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="w-full px-12 justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Uploading...
        </p>
        <div className="flex flex-col gap-2">
          {files.map((file, index) => (
            <UploadPreviewer file={file} progress={progress} index={index} key={index} />
          ))}
        </div>
        <Callout type="warning" className="mt-0">
          {uploading}
        </Callout>
      </div>
    )
  }

  return (
    <form className="mt-6 flex flex-col px-4 gap-4">
      <div className="flex flex-row items-center gap-4">
        <label htmlFor="name" className="w-[20%] text-right">
          System Name
        </label>
        <div className="w-[80%] items-center align-middle flex-grow">
          <SystemList systemList={systems} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
        </div>
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="name" className="w-[20%] text-right">
          Team Name
        </label>
        <div className="w-[80%] items-center align-middle flex-grow ">
          <input
            disabled={true}
            className="w-full disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
            id="description"
            type="text"
            name="description"
            value={description}
          />
        </div>
      </div>

      <div className="flex flex-row items-center gap-4 mt-4">
        <label htmlFor="name" className="w-[20%] text-left font-semibold">
          Videos Upload
        </label>
        <div className="w-[80%] flex-grow "></div>
      </div>
      <div className="items-center">
        <div
          {...getRootProps()}
          style={{ border: "2px dashed #666666" }}
          className="w-full p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center text-center appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        >
          <input id="upload" {...getInputProps()} accept={allowText ? "video/*,.txt,text/plain" : "video/*"} />
          {previews.length > 0 && (
            <ul className="w-full flex flex-wrap gap-2 justify-center">
              {previews.map(({ file, url }, index) => (
                <li title={file.name} key={index} className="min-w-24 max-w-40 flex flex-col justify-center items-center gap-1 p-2 border rounded-md border-black">
                  {file.name.toLowerCase().endsWith(".txt") ? (
                    <div title={file.name} className="flex h-20 w-full items-center justify-center text-3xl">
                      📄
                    </div>
                  ) : (
                    <video title={file.name} width={200} height={80} controls>
                      <source src={url} type={file.type} />
                      Your browser does not support the video tag.
                    </video>
                  )}
                  <p title={file.name} className="w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                    {file.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag and drop some files here, or click to select files{allowText ? " (.mp4 videos and .txt descriptions)" : ""}</p>
          )}
        </div>
      </div>

      {validMsg && (
        <div className="w-full pl-[20%]">
          <Callout type="error" className="mt-0">
            {validMsg}
          </Callout>
        </div>
      )}

      <div className="flex flex-col items-center">
        <div className="flex justify-start">
          <button
            className="cursor-pointer select-none flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm transition-all"
            onClick={handleUpload}
          >
            {uploadState.type === "loading" ? <CircleLoading className="w-6 h-6" /> : <></>}
            Upload Video
          </button>
        </div>
      </div>
    </form>
  )
}
