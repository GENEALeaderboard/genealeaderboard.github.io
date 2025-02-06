"use client"

import React, { Fragment, useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Callout } from "@/nextra"
import { Loading } from "@/components/loading/loading"
import axios from "axios"
import clsx from "clsx"
import BVHFile from "@/icons/bvhfile"
import { Select } from "@headlessui/react"
import VideoFile from "@/icons/videofile"
import {
  VIDEO_START_UPLOAD_API_ENDPOINT,
  VIDEO_UPLOAD_PART_API_ENDPOINT,
  VIDEO_COMPLETE_UPLOAD_API_ENDPOINT,
} from "@/config/constants"

// export default function UploadVideos({ codes, teams }) {
export default function UploadMismatchVideos({ teams }) {
  const [team, setTeam] = useState(teams[0])
  const [teamID, setTeamID] = useState(teams[0].userId)
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [errorMsg, setErrorMsg] = useState("")
  const [uploading, setUploading] = useState("")
  // const [uploadProgress, setUploadProgress] = useState({})
  const [progress, setProgress] = useState({})
  const [success, setSuccess] = useState("")

  // const [missingList, setMissingList] = useState([])

  const onDrop = useCallback(async (acceptedFiles) => {
    setErrorMsg("")
    setUploading("")
    setSuccess("")

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
    setProgress({})

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

  const uploadPromise = (file, onProgress) => {
    const formData = new FormData()
    formData.append("userId", teamID)
    formData.append("video", file)

    return axios
      .post(VIDEO_START_UPLOAD_API_ENDPOINT, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          onProgress(file.name, percentCompleted)
        },
      })
      .then((response) => {
        console.log("response", response)
        return response.data
      })
      .catch((error) => {
        console.error("error", error.response.data)
        return error.response.data
      })
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (files.length <= 0) {
      setErrorMsg("Please upload video")
      return
    }

    // if (missingList.length > 0) {
    //   setErrorMsg("Please upload missing files")
    //   return
    // }

    try {
      setUploading("Uploading your videos, please waiting ...")

      const uploadPromises = Array.from(files).map((file) => {
        return uploadPromise(file, (fileName, percent) => {
          setProgress((prevProgress) => {
            // console.log("prevProgress", prevProgress)
            return {
              ...prevProgress,
              [fileName]: percent,
            }
          })
        })
      })

      const results = await Promise.all(uploadPromises)
      // console.log("results", results)
      const allSuccessful = results.every((result) => result.success)
      if (allSuccessful) {
        const { success, msg, error } = results.at(-1)
        setSuccess(msg)
        console.log("Success", success, "msg", msg, "error", error)
      } else {
        const failedResult = results.filter((result) => !result.success)[0]
        const { success, msg, error } = failedResult
        setErrorMsg(msg)
        console.log("Success", success, "msg", msg, "error", error)
      }
    } catch (error) {
      console.log("EXCEPTION ", error)
      setErrorMsg(
        "EXCEPTION: Error with uploading your videos, please contact support"
      )
      console.log("Exception", error)
    } finally {
      setUploading("")
    }
  }

  if (teams.length <= 0) {
    return <></>
  }

  if (success) {
    return (
      <div className="w-full p-12 justify-center ">
        <Callout type="info" className="mt-0">
          {success}
        </Callout>
      </div>
    )
  }

  if (uploading) {
    return (
      <div className="w-full px-12  justify-center ">
        <p className="text-center p-4">Uploading...</p>
        <div className="flex flex-col gap-2">
          {files.map((file, idx) => {
            // console.log("progress", progress)

            return (
              <div
                className=" mx-32 flex gap-2 items-center border-gray-200 py-2 px-8 shadow"
                key={idx}
              >
                <div className="p-1 bg-gray-200 rounded-lg">
                  <VideoFile />
                </div>
                <span className="text-sm">{file.name}</span>
                <div className="flex-grow">
                  <div className="overflow-hidden mx-auto max-w-96 h-2 text-xs flex rounded-3xl bg-blue-200">
                    {progress[file.name] ? (
                      <div
                        style={{ width: `${progress[file.name]}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                      >
                        <span className="relative left-0 right-0 w-full text-center text-blue-800"></span>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <span className="text-xs bg-gray-200 px-2 rounded-xl">
                  {`${progress[file.name] || 0}%`}
                </span>
              </div>
            )
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
      <div className="flex flex-row items-center gap-4">
        <label htmlFor="name" className="w-[20%] flex justify-end">
          Team
        </label>
        <Select name="status" as={Fragment}>
          {({ focus, hover }) => (
            <select
              className={clsx(
                "border",
                focus && "bg-blue-100",
                hover && "shadow",
                "flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
              )}
              onChange={(e) => setTeamID(e.target.value)}
              aria-label="Project status"
            >
              {teams.map((team, index) => (
                <option
                  key={index}
                  className="text-gray-800 dark:text-gray-100 relative cursor-pointer whitespace-nowrap py-1.5 transition-colors ltr:pl-3 ltr:pr-9 rtl:pr-3 rtl:pl-9"
                  value={team.userId}
                >
                  {team.teamname}
                </option>
              ))}
            </select>
          )}
        </Select>
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="userId" className="w-[20%] flex justify-end">
          Team ID
        </label>
        <input
          disabled={true}
          className="flex-grow min-w-0 disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="userId"
          type="userId"
          name="userId"
          value={teamID}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="upload" className="w-[20%] flex justify-end">
          Videos Upload
        </label>
        <div
          {...getRootProps()}
          style={{ border: "2px dashed #666666" }}
          className="w-[80%] p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center text-center appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        >
          <input id="upload" {...getInputProps()} accept="video/*" />
          {previews.length > 0 && (
            <ul className="w-full flex flex-wrap gap-2 justify-center">
              {previews.map(({ file, url }, index) => (
                <li
                  key={index}
                  className="w-32 flex flex-col justify-center items-center gap-1 p-2  border rounded-md border-black"
                >
                  <video width="160" height="120" controls>
                    <source src={url} type={file.type} />
                    Your browser does not support the video tag.
                  </video>
                  <p>{file.name}</p>
                </li>
              ))}
            </ul>
          )}
          {isDragActive ? (
            <p>Drop the files here...</p>
          ) : (
            <p>Drag and drop some files here, or click to select files</p>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="w-full pl-[20%]">
          <Callout type="error" className="mt-0">
            {errorMsg}
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
        <div className="pl-[20%] flex justify-start">
          <button
            className=" flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
            onClick={handleUpload}
          >
            Upload Video
          </button>
        </div>
      </div>
    </form>
  )
}
