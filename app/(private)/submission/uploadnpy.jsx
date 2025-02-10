"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Callout } from "@/nextra"
import { Loading } from "@/components/loading/loading"
import axios from "axios"
import BVHFile from "@/icons/bvhfile"
import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import { UploadStatus } from "@/components/UploadStatus"
import { useAuth } from "@/contexts/auth"
import NPYIcon from "@/icons/npy"
import CircleLoading from "@/icons/circleloading"
import UploadPreviewer from "./UploadPreviewer"
import { apiPost, apiPatch } from "@/utils/fetcher"

export default function UploadNPY({ codes, user, status }) {
  const [email, setEmail] = useState(user ? user.email : "")
  const [teamname, setTeamName] = useState(user ? user.name : "")
  const [username, setUsername] = useState(user ? user.username : "")
  const [userid, setUserId] = useState(user ? user.userid : "")
  const [files, setFiles] = useState([])
  const [previews, setPreviews] = useState([])
  const [uploading, setUploading] = useState("")
  // const [uploadProgress, setUploadProgress] = useState({})
  const [progress, setProgress] = useState({})
  const [validMsg, setValidMsg] = useState("")
  const [uploadState, setUploadState] = useState({ type: "", message: "" })

  const [missingList, setMissingList] = useState([])

  const onDrop = useCallback(
    async (acceptedFiles) => {
      setValidMsg("")
      setUploading("")
      for (let npyFile of acceptedFiles) {
        if (!npyFile.name.endsWith(".npy")) {
          setValidMsg("Please upload only NPY files")
          return
        }

        if (npyFile.size > 100 * 1024 * 1024) {
          setValidMsg("File size is too large, please upload file less than 100MB")
          return
        }
      }

      const missing = []
      codes.map((code) => {
        const found = acceptedFiles.find((file) => file.name === `${code}.npy`)
        if (!found) {
          missing.push(`${code}.npy`)
        }
      })
      setMissingList(missing)
      setFiles(acceptedFiles)
      setProgress(
        Array.from(acceptedFiles).reduce((progressItems, fileItem) => {
          progressItems[fileItem.name] = { percent: 0, status: "pending" }
          return progressItems
        }, {})
      )

      const selectedFiles = Array.from(acceptedFiles)
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((file) => ({
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
    },
    [codes]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const setUploadProgress = useCallback((fileName, percent, status) => {
    setProgress((prevProgress) => {
      return {
        ...prevProgress,
        [fileName]: { percent: percent, status: status },
      }
    })
  }, [])

  const simpleUploadFile = async (file, index, username) => {
    const fileName = file.name
    const fileSize = file.size

    try {
      setUploadProgress(fileName, 0, "uploading")
      const UPLOAD_URL = `${UPLOAD_API_ENDPOINT}/upload/npy`

      // Start multipart upload
      const resp = await axios.post(
        UPLOAD_URL,
        {
          username,
          fileName,
          file,
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

      return resp.data
    } catch (err) {
      console.error("Error uploading file:", err)
      setValidMsg("Error uploading file")
      setUploadProgress(fileName, 0, "error")
      return { success:false, msg:"Exception on uploading file", error:null }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()

    if (!user) {
      setValidMsg("Please login with github")
      return
    }

    if (files.length <= 0) {
      setValidMsg("Please upload video")
      return
    }

    if (missingList.length > 0) {
      setValidMsg("Please upload missing files")
      return
    }

    if (!user.email) {
      setValidMsg("Please add email address")
      return
    }

    if (!user.name) {
      setValidMsg("Please add your team name")
      return
    }

    try {
      const submission = {
        email: email,
        teamname: teamname,
        teamid: username,
        status: "new",
      }
      const res = await apiPost("/api/submissions", { submission: submission })
      console.log("res", res)
      const submitid = res.data.submitid

      if (!res.success) {
        console.log("Failed submission", res)
        setUploadState({ type: "error", message: "Error with your submission, please contact for support!" })
        return
      }
      setUploading("Uploading your submission, please waiting ...")
      const usernameid = String(username).toLowerCase()

      //~~~~~~~~  Upload all npy files ~~~~~~~~
      // console.log("files", files)
      const results = []
      for (let index = 0; index < files.length; index++) {
        const result = await simpleUploadFile(files[index], index, usernameid)
        console.log("result", result)

        if (!result.success) {
          setUploadState({ type: "error", message: result.msg })
          return
        }
        results.push(result)
      }

      console.log("results.uploadFile", results)
      const allSuccessful = results.every((result) => result.success)
      if (allSuccessful) {
        //~~~~~~~~  Update submission info to database ~~~~~~~~
        const resPatch = await apiPatch("/api/submissions", {
          submitid: submitid,
          submitStatus: "success",
        })
        console.log("res", res)
        setUploadState({ type: "info", message: "Your submission has been uploaded successfully" })
      } else {
        const failedResult = results.filter((result) => !result.success)[0]
        const { success, msg, error } = failedResult
        setValidMsg(msg)
        console.log("Success", success, "msg", msg, "error", error)
      }
    } catch (error) {
      setUploadState({ type: "error", message: "Error with your submission, please contact for support!" })
      console.log("Exception", error)
    } finally {
      setUploading("")
    }
  }

  if (status === "unauthenticated" || !user) {
    return <Callout type="error">Please login with github</Callout>
  }

  if (!codes || codes.length <= 0) {
    return <Callout type="error">Failed get codes, please contact for support</Callout>
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
        <div className="flex flex-col gap-2">
          {files.map((file, index) => {
            return <UploadPreviewer file={file} progress={progress} index={index} key={index} />
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
        <label htmlFor="name" className="w-[20%] text-right">
          Team Name
        </label>
        <input
          className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="name"
          type="name"
          name="name"
          value={teamname}
          onChange={(e) => setTeamName(e.target.value)}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="email-address" className="w-[20%] text-right">
          Email address
        </label>
        <input
          className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="email-address"
          type="email"
          name="email-address"
          value={user.email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="username" className="w-[20%] text-right">
          Username <span>*</span>
        </label>
        <input
          disabled={true}
          className="flex-grow disabled:bg-gray-200 min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="username"
          type="username"
          name="username"
          value={username}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="userId" className="w-[20%] text-right">
          Your ID <span>*</span>
        </label>
        <input
          disabled={true}
          className="flex-grow min-w-0 disabled:bg-gray-200 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
          id="userId"
          type="userId"
          name="userId"
          value={userid}
        />
      </div>

      <div className="flex flex-row items-center gap-4">
        <label htmlFor="upload" className="w-[20%] text-right">
          NPY Files Upload
        </label>
        <div
          {...getRootProps()}
          style={{ border: "2px dashed #666666" }}
          className="w-[80%] p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center text-center appearance-none border border-[#666666] bg-white text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        >
          <input id="upload" {...getInputProps()} type="file" accept=".npy" multiple={true} />
          {previews.length > 0 && (
            <>
              <ul className="w-full flex flex-wrap gap-2 justify-center">
                {previews.map(({ file, url }, index) => (
                  <li title={file.name} key={index} className="w-44">
                    <div
                      title={file.name}
                      className="px-4 overflow-hidden text-ellipsis whitespace-nowrap text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-neutral-900 flex items-center h-10 gap-2 rounded-md border border-gray-300 dark:border-neutral-700 contrast-more:border-gray-900 contrast-more:dark:border-gray-50"
                    >
                      <NPYIcon className="w-5 h-5" />
                      <span className="truncate">{file.name}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </>
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

      {missingList.length > 0 && (
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
      )}

      <div className="flex flex-col items-center">
        <div className="pl-[20%] flex justify-start">
          <button
            className="cursor-pointer font-bold flex h-10 items-center gap-2 w-44 betterhover:hover:bg-gray-600 dark:betterhover:hover:bg-gray-300 justify-center rounded-md border border-transparent bg-black px-4 py-2 text-base text-white focus:outline-none focus:ring-2 focus:ring-gray-800 dark:bg-white dark:text-black dark:focus:ring-white sm:text-sm  transition-all "
            onClick={handleUpload}
          >
            Submission
          </button>
        </div>
      </div>
    </form>
  )
}
