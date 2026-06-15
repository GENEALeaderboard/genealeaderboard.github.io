"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Speech Mismatch"
      description="Videos in R2 used by the Seamless Speech Mismatch study. Matched and mismatched videos live in sibling folders under videos/seamless-speech-mismatch/."
      folders={[
        { label: "Matched", folder: "seamless-speech-mismatch/matched" },
        { label: "Mismatched", folder: "seamless-speech-mismatch/mismatched" },
        { label: "Attention check", folder: "attentioncheck/seamless-speech-mismatch" },
      ]}
    />
  )
}
