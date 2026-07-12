"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { Callout } from "@/nextra"
import CircleLoading from "@/icons/circleloading"
import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import { apiPost } from "@/utils/fetcher"
import { generateUUID } from "@/utils/generateUUID"

// The four votes a rater can cast on a semantic page: the left sentence, the
// right sentence, both equally, or neither. An attention check pins the correct
// one so the study app can flag raters who answer against it.
const VOTE_OPTIONS = [
  { value: "left", label: "Left sentence (Sentence 1)" },
  { value: "right", label: "Right sentence (Sentence 2)" },
  { value: "both", label: "Both sentences equally" },
  { value: "neither", label: "Neither sentence" },
]

// Authors one semantic attention check at a time: a single video shown with two
// fixed descriptions (left and right) plus the expected vote — left, right, both
// or neither. The video is uploaded to R2; the two texts and the expected vote
// are stored on the attentioncheck row via geneaapi.
export default function UploadSemanticAttentionCheck({ category = "seamless-semantic-mismatch" }) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [leftText, setLeftText] = useState("")
  const [rightText, setRightText] = useState("")
  const [expectedVote, setExpectedVote] = useState("left")
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
    setLeftText("")
    setRightText("")
    setExpectedVote("left")
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setValidMsg("")

    if (!file) {
      setValidMsg("Please upload a video")
      return
    }
    if (!leftText.trim() || !rightText.trim()) {
      setValidMsg("Both the left and right descriptions are required")
      return
    }
    if (!VOTE_OPTIONS.some((o) => o.value === expectedVote)) {
      setValidMsg("Please choose an expected vote")
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

      // 2) Store the check: its two texts and the expected vote.
      const res = await apiPost("/api/attention-check/semantic", {
        video: { inputcode: videoMeta.inputcode, path: videoMeta.path, url: videoMeta.url },
        leftText,
        rightText,
        expectedVote,
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
        <label className="font-semibold" htmlFor="leftText">
          Left description (Sentence 1)
        </label>
        <textarea
          id="leftText"
          className="w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm min-h-24"
          value={leftText}
          onChange={(e) => setLeftText(e.target.value)}
          placeholder="The description shown on the left / as Sentence 1."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="rightText">
          Right description (Sentence 2)
        </label>
        <textarea
          id="rightText"
          className="w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm min-h-24"
          value={rightText}
          onChange={(e) => setRightText(e.target.value)}
          placeholder="The description shown on the right / as Sentence 2."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="expectedVote">
          Expected vote
        </label>
        <select
          id="expectedVote"
          className="w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm"
          value={expectedVote}
          onChange={(e) => setExpectedVote(e.target.value)}
        >
          {VOTE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">The vote a careful rater should cast. Raters who answer otherwise fail the check.</p>
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
