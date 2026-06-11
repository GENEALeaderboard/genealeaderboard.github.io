"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Dyadic Mismatch"
      description="Videos in R2 used by the Seamless Dyadic Mismatch study (matched and mismatched sides)."
      folders={[
        { label: "Origin", folder: "seamless-dyadic-origin" },
        { label: "Mismatch", folder: "seamless-dyadic-mismatch" },
        { label: "Attention check", folder: "attentioncheck/seamless-dyadic-mismatch" },
      ]}
    />
  )
}
