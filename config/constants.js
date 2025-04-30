import { isValidElement } from "react"

export const SYSTEM_TYPES = ["groundtruth", "system", "baseline"]

export const DEFAULT_THEME = {
  darkMode: true,
  direction: "ltr",
}

export const ERROR_ROUTES = new Set(["/404", "/500"])

export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
export const GITHUB_REDIRECT_URI = `${API_ENDPOINT}/auth/callback/github`

// ************************ NPY ************************
// https://upload.hemvip.workers.dev
export const UPLOAD_API_ENDPOINT = process.env.NEXT_PUBLIC_UPLOAD_API_ENDPOINT

export const STUDY_TYPES = {
  pairwiseHumanLikeness: { key: "pairwise-humanlikeness", label: "Pairwise Human-Likeness Studies", type: "origin" },
  pairwiseEmotion: { key: "pairwise-emotion", label: "Pairwise Emotion Studies", type: "origin" },
  mismatchSpeech: { key: "mismatch-speech", label: "Mismatch Speech Studies", type: "mismatch-speech" },
  mismatchEmotion: { key: "mismatch-emotion", label: "Mismatch Emotion Studies", type: "mismatch-emotion" },
}
export const STUDY_KEYS = Object.keys(STUDY_TYPES)

export const MISMATCH_TYPES = {
  speech: { label: "Speech Mismatch", value: "speech", type: "mismatch-speech" },
  emotion: { label: "Emotion Mismatch", value: "emotion", type: "mismatch-emotion" },
}

export const ATTENTION_CHECK_EXPECTED_VOTE = ["Reference", "LeftClearlyBetter", "LeftSlightlyBetter", "TheyAreEqual", "RightSlightlyBetter", "RightClearlyBetter"]

export const N_ATTENTION_CHECK_PER_STUDY = 4
