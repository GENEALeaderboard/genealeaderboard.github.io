"use client"

import React, { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import axios from "axios"
import { Callout } from "@/nextra"
import { UPLOAD_API_ENDPOINT } from "@/config/constants"
import CircleLoading from "@/icons/circleloading"

// Uploads the Seamless Semantic Mismatch correct-text descriptions. One .txt per
// input code, file name = input code (e.g. `clip_001.txt`). The descriptions are
// system-independent, so they are uploaded here on the Input Codes page rather
// than alongside the videos. Each file is stored in R2 keyed by input code.
export default function SemanticTextUpload({ codes = [] }) {
  const [files, setFiles] = useState([])
  const [validMsg, setValidMsg] = useState("")
  const [uploading, setUploading] = useState(false)
  const [results, setResults] = useState([])

  const knownCodes = new Set((codes || []).map((c) => String(c).trim().replace(/\.[^.]+$/, "")))

  const onDrop = useCallback((acceptedFiles) => {
    setValidMsg("")
    setResults([])
    for (const f of acceptedFiles) {
      if (!f.name.toLowerCase().endsWith(".txt")) {
        setValidMsg("Please upload only .txt files (one per input code, named after the code).")
        return
      }
    }
    setFiles(acceptedFiles)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "text/plain": [".txt"] } })

  const uploadOne = async (file) => {
    const fileName = file.name
    try {
      const { data } = await axios.post(
        `${UPLOAD_API_ENDPOINT}/upload/semantic-text`,
        { fileName, file },
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      )
      return { fileName, success: !!data?.success, msg: data?.msg || "" }
    } catch (err) {
      return { fileName, success: false, msg: err?.response?.data?.msg || "Upload failed" }
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (files.length === 0) {
      setValidMsg("Please choose one or more .txt files.")
      return
    }
    setUploading(true)
    const out = []
    for (const file of files) {
      out.push(await uploadOne(file))
    }
    setResults(out)
    setUploading(false)
  }

  // Filenames that don't match any known input code — likely a typo/extra file.
  const unknown = files
    .map((f) => f.name.replace(/\.[^.]+$/, ""))
    .filter((code) => knownCodes.size > 0 && !knownCodes.has(code))

  return (
    <form className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        style={{ border: "2px dashed #666666" }}
        className="w-full p-4 cursor-pointer rounded-lg min-h-28 flex flex-col items-center justify-center text-center bg-white text-base text-gray-900 dark:bg-transparent dark:text-white sm:text-sm"
      >
        <input {...getInputProps()} />
        {files.length > 0 ? (
          <ul className="flex flex-wrap gap-2 justify-center">
            {files.map((file, i) => (
              <li key={i} title={file.name} className="flex flex-col items-center gap-1 p-2 border rounded-md">
                <span className="text-2xl">📄</span>
                <span className="w-28 overflow-hidden text-ellipsis whitespace-nowrap">{file.name}</span>
              </li>
            ))}
          </ul>
        ) : isDragActive ? (
          <p>Drop the .txt files here...</p>
        ) : (
          <p>Drag and drop the description .txt files here, or click to select. File name must match the input code.</p>
        )}
      </div>

      {validMsg && <Callout type="error" className="mt-0">{validMsg}</Callout>}
      {unknown.length > 0 && (
        <Callout type="warning" className="mt-0">
          These file names don&apos;t match any current input code: {unknown.join(", ")}. Add the codes first or fix the file names.
        </Callout>
      )}

      {results.length > 0 && (
        <div className="flex flex-col gap-1 text-sm">
          {results.map((r, i) => (
            <div key={i} className={r.success ? "text-green-600" : "text-red-600"}>
              {r.success ? "✓" : "✗"} {r.fileName} {r.success ? "" : `— ${r.msg}`}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          className="cursor-pointer flex h-10 items-center gap-2 w-44 justify-center rounded-md border border-transparent bg-neutral-800 px-4 py-2 text-base font-bold text-white dark:bg-white dark:text-black sm:text-sm"
          onClick={handleUpload}
          disabled={uploading}
        >
          {uploading ? <CircleLoading className="w-6 h-6" /> : null}
          Upload Descriptions
        </button>
      </div>
    </form>
  )
}
