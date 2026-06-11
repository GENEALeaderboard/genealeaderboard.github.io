"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { Callout } from "@/nextra"
import CircleLoading from "@/icons/circleloading"
import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import { apiPost } from "@/utils/fetcher"
import { generateUUID } from "@/utils/generateUUID"

// Authors one text-based semantic attention check at a time: a single video plus
// the expected (correct) description and a distractor. The video is uploaded to
// R2; the two texts are stored on the attentioncheck row via geneaapi.
export default function UploadSemanticAttentionCheck({ category = "seamless-semantic-mismatch" }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [expectedText, setExpectedText] = useState("")
  const [distractorText, setDistractorText] = useState("")
  const [validMsg, setValidMsg] = useState("")
  const [uploading, setUploading] = useState(false)
  const [state, setState] = useState({ type: "", message: "" })

  const onDrop = useCallback((acceptedFiles) => {
    setValidMsg("")
    const picked = acceptedFiles[0]
    if (!picked) return
    if (!picked.name.toLowerCase().endsWith(".mp4")) {
      setValidMsg("Please upload an .mp4 file")
      return
    }
    if (picked.size > 100 * 1024 * 1024) {
      setValidMsg("File size is too large, please upload file less than 100MB")
      return
    }
    setFile(picked)
    setPreviewUrl(URL.createObjectURL(picked))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, multiple: false })

  const resetForm = () => {
    setFile(null)
    setPreviewUrl("")
    setExpectedText("")
    setDistractorText("")
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setValidMsg("")

    if (!file) {
      setValidMsg("Please upload a video")
      return
    }
    if (!expectedText.trim() || !distractorText.trim()) {
      setValidMsg("Both the expected and distractor text are required")
      return
    }

    try {
      setUploading(true)
      setState({ type: "", message: "" })

      // 1) Upload the video to R2.
      const { data: responseUpload } = await axios.post(
        `${UPLOAD_API_ENDPOINT}/upload/attention-check`,
        { fileName: `${generateUUID(6)}.mp4`, inputCode: "semantic-check", fileSize: file.size, file, category },
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      )
      const videoMeta = responseUpload.data
      if (!videoMeta || !videoMeta.path) {
        setState({ type: "error", message: responseUpload.msg || "Video upload failed" })
        return
      }

      // 2) Store the check + its two texts.
      const res = await apiPost("/api/attention-check/semantic", {
        video: { inputcode: videoMeta.inputcode, path: videoMeta.path, url: videoMeta.url },
        correctText: expectedText,
        distractorText,
        category,
      })

      if (res.success) {
        setState({ type: "info", message: "Attention check saved. You can add another." })
        resetForm()
      } else {
        setState({ type: "error", message: res.msg })
      }
    } catch (error) {
      console.error("EXCEPTION", error)
      setState({ type: "error", message: "Error uploading attention check, please contact support." })
    } finally {
      setUploading(false)
    }
  }

  return (
    <form className="mt-6 flex flex-col px-4 gap-4">
      {state.message && (
        <Callout type={state.type === "error" ? "error" : "info"} className="mt-0">
          {state.message}
        </Callout>
      )}

      <div
        {...getRootProps()}
        style={{ border: "2px dashed #666666" }}
        className="w-full p-4 cursor-pointer rounded-lg min-h-36 flex flex-col items-center justify-center text-center border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm"
      >
        <input id="upload" {...getInputProps()} accept="video/*" />
        {previewUrl && file && (
          <div className="flex flex-col items-center gap-1 p-2">
            <video title={file.name} width={240} height={96} controls>
              <source src={previewUrl} type={file.type} />
            </video>
            <p className="w-40 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</p>
          </div>
        )}
        {isDragActive ? <p>Drop the file here...</p> : <p>Drag and drop a single .mp4 here, or click to select</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="expectedText">
          Expected (correct) description
        </label>
        <textarea
          id="expectedText"
          className="w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm min-h-24"
          value={expectedText}
          onChange={(e) => setExpectedText(e.target.value)}
          placeholder="The description that matches the video — the rater should select this."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="distractorText">
          Distractor description
        </label>
        <textarea
          id="distractorText"
          className="w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm min-h-24"
          value={distractorText}
          onChange={(e) => setDistractorText(e.target.value)}
          placeholder="The incorrect description shown alongside the expected one."
        />
      </div>

      {validMsg && (
        <Callout type="error" className="mt-0">
          {validMsg}
        </Callout>
      )}

      <div className="flex justify-start">
        <button
          className="cursor-pointer select-none flex h-10 items-center gap-2 w-52 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-base font-bold text-white disabled:opacity-50 dark:bg-white dark:text-black sm:text-sm transition-all"
          disabled={uploading}
          onClick={handleUpload}
        >
          {uploading ? <CircleLoading className="w-6 h-6" /> : null}
          {uploading ? "Uploading..." : "Upload Attention Check"}
        </button>
      </div>
    </form>
  )
}
