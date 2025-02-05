"use client"

import React, { useState } from "react"

export default function InputCode({ codes }) {
  // const csvString = codes.map((codes) => codes.join(",")).join("\n")

  const handleDownload = () => {
    const csvArray = []
    csvArray.push("id, code, text_input, motion_file_output")
    codes.map((code, index) => {
      csvArray.push(
        `${index + 1} , ${code}, Text Input ${index + 1}, ${code}.bvh`
      )
    })
    const csvContent = csvArray.join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "inputcode.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  return (
    <div className="flex flex-row items-center gap-4 mt-6">
      <label htmlFor="inputcode" className="flex justify-end w-[15%]">
        Input Codes
      </label>
      <textarea
        className="flex-grow min-w-0 appearance-none rounded-md border border-[#666666] bg-white px-4 py-2 text-base text-gray-900 placeholder-gray-500 focus:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-800 dark:border-[#888888] dark:bg-transparent dark:text-white dark:focus:border-white sm:text-sm"
        id="inputcode"
        rows="10"
        name="inputcode"
        disabled={true}
        value={JSON.stringify(codes, null, 2)}
      />

      <div className="pl-14 flex justify-start">
        <a
          className="text-primary-600 underline decoration-from-font [text-underline-position:from-font] "
          onClick={handleDownload}
        >
          Download CSV
        </a>
      </div>
    </div>
  )
}
