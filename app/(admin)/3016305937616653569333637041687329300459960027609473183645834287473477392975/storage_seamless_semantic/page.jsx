"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Semantic Mismatch"
      description="Videos in R2 used by the Seamless Semantic Mismatch study (matched and mismatched sides)."
      folders={[
        { label: "Origin", folder: "seamless-semantic-origin" },
        { label: "Mismatch", folder: "seamless-semantic-mismatch" },
        { label: "Attention check", folder: "attentioncheck/seamless-semantic-mismatch" },
      ]}
    />
  )
}
