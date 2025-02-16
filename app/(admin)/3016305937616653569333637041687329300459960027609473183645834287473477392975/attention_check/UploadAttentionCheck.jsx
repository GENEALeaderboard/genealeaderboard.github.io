"use client"

import React, { Fragment, useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Callout } from "@/nextra"
import { Loading } from "@/components/loading/loading"
import axios from "axios"
import clsx from "clsx"
import BVHFile from "@/icons/bvhfile"
import { Select } from "@headlessui/react"
import { ATTENTION_CHECK_EXPECTED_VOTE, UPLOAD_API_ENDPOINT } from "@/config/constants"
import { UploadStatus } from "@/components/UploadStatus"
import CircleLoading from "@/icons/circleloading"
import Mp4Icon from "@/icons/mp4"
import VideoPreviewer from "./VideoPreviewer"
import { apiPost } from "@/utils/fetcher"
import { generateUUID } from "@/utils/generateUUID"

export default function UploadAttetionCheck() {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [validMsg, setValidMsg] = useState("")
  const [uploading, setUploading] = useState("")
  // const [uploadProgress, setUploadProgress] = useState({})
  const [progress, setProgress] = useState({})
  const [uploadState, setUploadState] = useState({ type: "", message: "" })
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const [isValidated, setValidated] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    setValidMsg("")
    setUploading("")

    for (let mp4File of acceptedFiles) {
      if (!mp4File.name.endsWith(".mp4")) {
        setValidMsg("Please upload only .mp4 files")
        return
      }

      if (mp4File.size > 100 * 1024 * 1024) {
        setValidMsg("File size is too large, please upload file less than 100MB")
        return
      }
    }

    // const missing = []
    // codes.map((code) => {
    //   const found = acceptedFiles.find((file) => file.name === `${code}.mp4`)
    //   if (!found) {
    //     missing.push(`${code}.mp4`)
    //   }
    // })
    // setMissingList(missing)

    // Do something with the files, like upload to a server
    // console.log("acceptedFiles", acceptedFiles)
    setFiles(acceptedFiles)
    // setProgress({})
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

    try {
      // handleUpload()
      // console.log(response.data.message)
    } catch (error) {
      console.error("Error uploading files:", error)
    }
    setUploading("")
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const setUploadProgress = useCallback((fileName, percent, status) => {
    setProgress((prevProgress) => {
      return {
        ...prevProgress,
        [fileName]: { percent: percent, status: status },
      }
    })
  }, [])

  const simpleUploadFile = async (file, randomFileName) => {
    try {
      const fileName = file.name
      const fileSize = file.size
      setUploadProgress(fileName, 0, "uploading")
      const VIDEO_UPLOAD_URL = `${UPLOAD_API_ENDPOINT}/upload/attention-check`

      console.log("VIDEO_UPLOAD_URL", VIDEO_UPLOAD_URL)

      // Start multipart upload
      const { data: responseUpload } = await axios.post(
        VIDEO_UPLOAD_URL,
        {
          fileName: randomFileName,
          fileSize: fileSize,
          file: file,
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
      // setErrorMsg("Error uploading file")
      setUploadProgress(fileName, 0, "error")
      return { success: false, msg: "Exception on uploading file", error: null }
    }
  }

  const handleValidate = async (e) => {
    e.preventDefault()

    if (files.length <= 0) {
      setValidMsg("Please upload video")
      return
    }

    try {
      let allValid = true
      for (let i = 0; i < files.length; i++) {
        const file = files[i]

        const filename = file.name.replace(/\.[^.]+$/, "")
        const idx = filename.split("_")[0]
        const expectedVote = filename.split("_")[1]
        console.log("idx", idx, "expectedVote", expectedVote)
        if (!ATTENTION_CHECK_EXPECTED_VOTE.includes(expectedVote)) {
          setValidMsg(`Expected vote is not valid: [${expectedVote}] in file ${file.name}`)
          allValid = false
          break
        }
      }
      if (allValid) {
        setValidated(true)
      }
    } catch (error) {
      setUploadState({ type: "error", message: error.message })
      console.log("EXCEPTION", error)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (files.length <= 0) {
      setValidMsg("Please upload video")
      return
    }

    try {
      setUploading("Uploading your videos, please waiting ...")
      setUploadState({ type: "loading", message: "" })

      const videoMeta = []

      for (let index = 0; index < files.length; index++) {
        const file = files[index]
        const fileName = file.name.replace(/\.[^.]+$/, "")
        const idx = fileName.split("_")[0]
        const expectedVote = fileName.split("_")[1]

        const fileNameRandomGen = `${generateUUID(6)}.mp4`
        const reponse = await simpleUploadFile(file, fileNameRandomGen)
        const { path, inputcode, url } = reponse

        if (!reponse) {
          setUploadState({ type: "error", message: reponse.msg })
          return
        }
        videoMeta.push({ path, inputcode, url, expectedVote, idx })
      }

      console.log("videoMeta", JSON.stringify(videoMeta))
      setUploading("Uploading your videos to database, please waiting ...")
      const resInsert = await apiPost("/api/attention-check", { videos: videoMeta })

      if (resInsert.success) {
        setUploadState({ type: "info", message: resInsert.msg })
      } else {
        console.log("resInsert", resInsert)
        setUploadState({ type: "error", message: resInsert.msg })
      }
    } catch (error) {
      setUploadState({ type: "error", message: "Error with your upload video, please contact for support!" })
      console.log("EXCEPTION", error)
    } finally {
      setUploading("")
    }
  }

  if (uploadState.message) {
    return (
      <div className="w-full p-12 justify-center ">
        <Callout type={uploadState.type} className="mt-0">
          {uploadState.message}
        </Callout>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="w-full px-12  justify-center ">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Uploading...
        </p>
        <div className="flex flex-col gap-2">
          {files.map((file, index) => {
            return <VideoPreviewer file={file} progress={progress} index={index} key={index} />
          })}
        </div>
        <Callout type="warning" className="mt-0">
          {uploading}
        </Callout>
      </div>
    )
  }

  return (
    <form className="mt-6 flex flex-col px-4 gap-4">
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
      <div className="items-center">
        <div
          {...getRootProps()}
          style={{ border: "2px dashed #666666" }}
          className="w-full p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center text-center appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        >
          <input id="upload" {...getInputProps()} accept="video/*" />
          {previews.length > 0 && (
            <ul className="w-full flex flex-wrap gap-2 justify-center">
              {previews.map(({ file, url }, index) => (
                <li title={file.name} key={index} className="min-w-24 max-w-40  flex flex-col justify-center items-center gap-1 p-2 border rounded-md border-black">
                  <video title={file.name} width={200} height={80} controls>
                    <source src={url} type={file.type} />
                    Your browser does not support the video tag.
                  </video>
                  <p title={file.name} className="w-32 overflow-hidden text-ellipsis whitespace-nowrap">
                    {file.name}
                  </p>
                </li>
              ))}
            </ul>
          )}
          {isDragActive ? <p>Drop the files here...</p> : <p>Drag and drop some files here, or click to select files</p>}
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
          {isValidated ? (
            <button
              className="cursor-pointer select-none flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
              onClick={handleUpload}
            >
              {uploadState.type === "loading" ? <CircleLoading className="w-6 h-6" /> : <></>}
              Upload Video
            </button>
          ) : (
            <button
              className="cursor-pointer select-none flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
              onClick={handleValidate}
            >
              {uploadState.type === "loading" ? <CircleLoading className="w-6 h-6" /> : <></>}
              Validate
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
