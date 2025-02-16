import { isValidElement } from "react"
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
  "pairwise-human-likeness": "pairwise human-likeness studies",
  "pairwise-emotion-studies": "pairwise emotion studies",
  "mismatch-speech-studies": "mismatch speech studies",
  "mismatch-emotion-studies": "mismatch emotion studies",
}

export const MISMATCH_TYPES = {
  speech: "Speech Mismatch",
  emotion: "Emotion Mismatch",
}

export const ATTENTION_CHECK_EXPECTED_VOTE = ["Reference", "LeftClearlyBetter", "LeftSlightlyBetter", "Equal", "RightSlightlyBetter", "RightClearlyBetter"]
