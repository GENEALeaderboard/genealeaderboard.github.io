"use client"

import React from "react"
import SeamlessStorage from "../storage/SeamlessStorage"

export default function Page() {
  return (
    <SeamlessStorage
      title="Storage · Seamless Human-Likeness"
      description="Videos in R2 used by the Seamless Human-Likeness study."
      folders={[
        { label: "Origin", folder: "seamless-origin-humanlikeness" },
        { label: "Attention check", folder: "attentioncheck/seamless-origin-humanlikeness" },
      ]}
    />
  )
}
