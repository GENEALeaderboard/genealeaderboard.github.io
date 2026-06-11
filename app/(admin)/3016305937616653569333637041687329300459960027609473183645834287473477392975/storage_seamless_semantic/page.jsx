"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Semantic Mismatch"
      description="Videos and their .txt text descriptions for the Seamless Semantic Mismatch study. There is no separate mismatched video pool — the correct and mismatched descriptions live in the study CSV."
      folders={[
        { label: "Videos & text descriptions", folder: "seamless-semantic-origin" },
        { label: "Attention check", folder: "attentioncheck/seamless-semantic-mismatch" },
      ]}
    />
  )
}
