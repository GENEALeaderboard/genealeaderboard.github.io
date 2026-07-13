"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { Callout } from "@/nextra"
import CircleLoading from "@/icons/circleloading"
import { ATTENTION_CHECK_TYPE, ATTENTION_CHECK_VOLUME, UPLOAD_API_ENDPOINT } from "@/config/constants"
import { apiPost } from "@/utils/fetcher"
import { generateUUID } from "@/utils/generateUUID"

// The comparative realism votes, labelled in terms of the two sides shown to the
// rater: the uploaded AC video is always on the LEFT, the distractor on the RIGHT.
const VOTE_OPTIONS = [
  { value: "LeftClearlyBetter", label: "AC video (left) — clearly better" },
  { value: "LeftSlightlyBetter", label: "AC video (left) — slightly better" },
  { value: "TheyAreEqual", label: "They are equal" },
  { value: "RightSlightlyBetter", label: "Distractor (right) — slightly better" },
  { value: "RightClearlyBetter", label: "Distractor (right) — clearly better" },
]

// Authors one paired attention check at a time: upload a single AC video, set the
// expected vote, and point at the real video it is compared against by giving that
// video's systemname + inputcode (the distractor). The AC video is uploaded to R2;
// the distractor is resolved to an existing videos row by geneaapi.
//
// `pools` lets the page scope which video `type` the distractor is resolved in.
// Realism has one implicit pool (= category); speech/dyadic pass the matched and
// mismatched pools, e.g. [{ value: "seamless-speech-mismatch/matched", label: "Matched" }, …].
// `defaultType`/`defaultVolume` seed the metadata a given study expects.
export default function UploadPairedAttentionCheck({
  category = "seamless-origin-humanlikeness",
  pools = null,
  defaultType = "Text",
  defaultVolume = "Muted",
}) {
  const [file, setFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [expectedVote, setExpectedVote] = useState("LeftClearlyBetter")
  const [distractorSystem, setDistractorSystem] = useState("")
  const [distractorCode, setDistractorCode] = useState("")
  const [distractorType, setDistractorType] = useState(pools && pools.length > 0 ? pools[0].value : category)
  const [type, setType] = useState(defaultType)
  const [volume, setVolume] = useState(defaultVolume)
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
    setExpectedVote("LeftClearlyBetter")
    setDistractorSystem("")
    setDistractorCode("")
    setDistractorType(pools && pools.length > 0 ? pools[0].value : category)
    setType(defaultType)
    setVolume(defaultVolume)
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    setValidMsg("")

    if (!file) {
      setValidMsg("Please upload the attention-check video")
      return
    }
    if (!VOTE_OPTIONS.some((o) => o.value === expectedVote)) {
      setValidMsg("Please choose an expected vote")
      return
    }
    if (!distractorSystem.trim() || !distractorCode.trim()) {
      setValidMsg("Distractor systemname and inputcode are required")
      return
    }

    try {
      setUploading(true)
      setState({ type: "", message: "" })

      // 1) Upload the AC video to R2.
      const { data: responseUpload } = await axios.post(
        `${UPLOAD_API_ENDPOINT}/upload/attention-check`,
        { fileName: `${generateUUID(6)}.mp4`, inputCode: "attention-check", fileSize: file.size, file, category },
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      )
      const videoMeta = responseUpload.data
      if (!videoMeta || !videoMeta.path) {
        setState({ type: "error", message: responseUpload.msg || "Video upload failed" })
        return
      }

      // 2) Store the check: the AC video vs the referenced distractor + expected vote.
      const res = await apiPost("/api/attention-check/paired", {
        video: { inputcode: videoMeta.inputcode, path: videoMeta.path, url: videoMeta.url },
        expectedVote,
        distractor: { systemname: distractorSystem.trim(), inputcode: distractorCode.trim() },
        distractorType,
        type,
        volume,
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

  const fieldClass =
    "w-full p-3 rounded-md border border-[#666666] bg-white text-base text-gray-900 dark:border-[#888888] dark:bg-transparent dark:text-white sm:text-sm"

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
        {isDragActive ? <p>Drop the file here...</p> : <p>Drag and drop the AC .mp4 here, or click to select</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-semibold" htmlFor="expectedVote">
          Expected vote
        </label>
        <select id="expectedVote" className={fieldClass} value={expectedVote} onChange={(e) => setExpectedVote(e.target.value)}>
          {VOTE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <p className="text-xs text-gray-500">The vote a careful rater should cast. The AC video is shown on the left, the distractor on the right.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">Distractor video (the real clip the AC is compared against)</span>
        {pools && pools.length > 1 && (
          <select className={fieldClass} value={distractorType} onChange={(e) => setDistractorType(e.target.value)}>
            {pools.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        )}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className={fieldClass}
            value={distractorSystem}
            onChange={(e) => setDistractorSystem(e.target.value)}
            placeholder="systemname (e.g. BA)"
          />
          <input
            className={fieldClass}
            value={distractorCode}
            onChange={(e) => setDistractorCode(e.target.value)}
            placeholder="inputcode (segment, .mp4 optional)"
          />
        </div>
        <p className="text-xs text-gray-500">
          Resolved to an existing uploaded video in the <code>{distractorType}</code> pool by systemname + inputcode.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex flex-col gap-2 flex-1">
          <label className="font-semibold" htmlFor="type">
            Type
          </label>
          <select id="type" className={fieldClass} value={type} onChange={(e) => setType(e.target.value)}>
            {ATTENTION_CHECK_TYPE.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="font-semibold" htmlFor="volume">
            Volume
          </label>
          <select id="volume" className={fieldClass} value={volume} onChange={(e) => setVolume(e.target.value)}>
            {ATTENTION_CHECK_VOLUME.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
      </div>
      <p className="text-xs text-gray-500">
        Type/volume must match what this study&apos;s generator filters on, or the check is skipped — realism needs{" "}
        <strong>Text</strong> + <strong>Muted</strong>; speech/dyadic need <strong>Audio</strong> or <strong>Text</strong> +{" "}
        <strong>Unmuted</strong>.
      </p>

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
