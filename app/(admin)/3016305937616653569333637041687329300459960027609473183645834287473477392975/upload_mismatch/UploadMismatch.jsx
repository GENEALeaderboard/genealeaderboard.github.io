"use client"

import React, { Fragment, useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Callout } from "@/nextra"
import { Loading } from "@/components/loading/loading"
import axios from "axios"
import clsx from "clsx"
import { Select } from "@headlessui/react"
import SystemList from "./SystemList"
import { MISMATCH_TYPES, UPLOAD_API_ENDPOINT } from "@/config/constants"
import { UploadStatus } from "@/components/UploadStatus"
import CircleLoading from "@/icons/circleloading"
import MismatchPreviewer from "./MismatchPreviewer"
import { apiPost } from "@/utils/fetcher"
import { ArrowLeftIcon } from "@/nextra/icons"

export default function UploadMismatchVideos({ systems, videosLoading }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [validMsg, setValidMsg] = useState("")
  const [uploading, setUploading] = useState("")
  // const [uploadProgress, setUploadProgress] = useState({})
  const [progress, setProgress] = useState({})
  const [uploadState, setUploadState] = useState({ type: "", message: "" })
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const [description, setDescription] = useState("")
  // const [missingList, setMissingList] = useState([])
  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  const [mismatchKey, setMismatchType] = useState(MISMATCH_TYPES.speech.value)

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

  useEffect(() => {
    if (systems && systems.length > 0) {
      setDescription(systems[selectedIndex].description)
    }
  }, [selectedIndex, systems])

  useEffect(() => {
    setSelectedIndex(0)
  }, [systems])

  const setUploadProgress = useCallback((fileName, percent, status) => {
    setProgress((prevProgress) => {
      return {
        ...prevProgress,
        [fileName]: { percent: percent, status: status },
      }
    })
  }, [])

  const simpleUploadFile = async (file, index, systemname, mismatchType) => {
    const fileName = file.name
    const fileSize = file.size

    try {
      setUploadProgress(fileName, 0, "uploading")
      const VIDEO_UPLOAD_URL = `${UPLOAD_API_ENDPOINT}/upload/mismatch`

      console.log("VIDEO_UPLOAD_URL", VIDEO_UPLOAD_URL)

      // Start multipart upload
      const { data: responseUpload } = await axios.post(
        VIDEO_UPLOAD_URL,
        {
          fileName: fileName,
          fileSize: fileSize,
          file: file,
          systemname: systemname,
          mismatchType: mismatchType,
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
      return { success: false, msg: err.message, err }
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

    // if (missingList.length > 0) {
    //   setErrorMsg("Please upload missing files")
    //   return
    // }

    try {
      setUploading("Uploading your videos, please waiting ...")
      setUploadState({ type: "loading", message: "" })
      console.log("systemname", systemname, "mismatchType", mismatchKey)
      const mismatchKeyType = MISMATCH_TYPES[mismatchKey].type

      const videoMeta = []
      for (let index = 0; index < files.length; index++) {
        const reponse = await simpleUploadFile(files[index], index, systemname, mismatchKey)
        const { path, inputcode, url } = reponse

        if (!reponse) {
          setUploadState({ type: "error", message: reponse.msg })
          return
        }
        videoMeta.push({ path, inputcode, url })
      }

      const videoDatas = videoMeta.map((meta) => {
        return {
          inputcode: meta.inputcode,
          systemname: systems[selectedIndex].name,
          path: meta.path,
          url: meta.url,
          systemid: systems[selectedIndex].id,
          type:mismatchKeyType
        }
      })

      // setUploading("Uploading your videos to database, please waiting ...")
      const resInsert = await apiPost("/api/videos", { videos: videoDatas })

      if (resInsert.success) {
        setUploadState({ type: "info", message: resInsert.msg })
      } else {
        setUploadState({ type: "error", message: resInsert.msg })
        console.log("resInsert", resInsert)
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
      <div className="w-full px-12  justify-center">
        <p className="flex justify-center p-4 gap-2">
          <CircleLoading />
          Loading ...
        </p>
      </div>
    )
  }

  if (!systems || systems.length <= 0) {
    return <Callout type="error">Not found any submitted system</Callout>
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
            return <MismatchPreviewer file={file} progress={progress} index={index} key={index} />
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
      <div className="flex flex-row items-center gap-4">
        <label htmlFor="name" className="w-[20%] text-right">
          System Name
        </label>
        <div className="w-[80%] items-center align-middle flex-grow">
          <SystemList systemList={systems} selectedIndex={selectedIndex} setSelectedIndex={setSelectedIndex} />
        </div>
      </div>

      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
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
      {/* ********************************************************************************** */}
      <div className="flex flex-row items-center gap-4">
        <label htmlFor="mismatchType" className="w-[20%] flex justify-end">
          Study Type
        </label>
        <div className="relative items-center align-middle flex-grow">
          <Select
            name="status"
            id="mismatchType"
            value={mismatchKey}
            onChange={(e) => {
              setMismatchType(e.target.value)
            }}
            className="w-full appearance-none rounded-md border border-[#666666] px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          >
            {({ focus, hover }) => (
              <Fragment>
                {Object.entries(MISMATCH_TYPES).map(([key, sysType]) => (
                  <option
                    key={key}
                    className="text-gray-800 dark:text-gray-100 relative cursor-pointer whitespace-nowrap py-1.5 transition-colors ltr:pl-3 ltr:pr-9 rtl:pr-3 rtl:pl-9"
                    value={sysType.value}
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
      {/* ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ */}
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

      {/* {missingList.length > 0 && (
        <Callout type="error">
          You upload missing following files:
          <div className="flex flex-wrap gap-2 text-sm">
            {missingList.map((filemis, index) => (
              <code key={index} className="text-xs px-2">
                {filemis}
              </code>
            ))}
          </div>
        </Callout>
      )} */}

      <div className="flex flex-col items-center">
        <div className="flex justify-start">
          <button
            className="cursor-pointer select-none flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-base font-bold text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
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
