"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Dyadic Mismatch"
      description="Videos in R2 used by the Seamless Dyadic Mismatch study (matched and mismatched sides)."
      folders={[
        { label: "Matched", folder: "seamless-dyadic-mismatch/matched" },
        { label: "Mismatched", folder: "seamless-dyadic-mismatch/mismatched" },
        { label: "Attention check", folder: "attentioncheck/seamless-dyadic-mismatch" },
      ]}
    />
  )
}
