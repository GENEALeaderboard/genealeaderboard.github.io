"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Speech Mismatch"
      description="Videos in R2 used by the Seamless Speech Mismatch study. The origin side reuses the Seamless Human-Likeness pool."
      folders={[
        { label: "Origin (shared with Human-Likeness)", folder: "seamless-origin-humanlikeness" },
        { label: "Mismatch", folder: "seamless-speech-mismatch" },
        { label: "Attention check", folder: "attentioncheck/seamless-speech-mismatch" },
      ]}
    />
  )
}
