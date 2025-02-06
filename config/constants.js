import { isValidElement } from "react"

export const DEFAULT_THEME = {
  darkMode: true,
  direction: "ltr",
}

export const ERROR_ROUTES = new Set(["/404", "/500"])

export const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT
export const GITHUB_CLIENT_ID = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID
export const AUTH_API_ENDPOINT = process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT
export const GITHUB_REDIRECT_URI = `${process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT}/auth/callback/github`

console.log("process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID", process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID)
console.log("process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT", process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT)
console.log("GITHUB_REDIRECT_URI", GITHUB_REDIRECT_URI)

// ************************ NPY ************************
// https://submission.hemvip.workers.dev/api/start-upload
export const UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_API_ENDPOINT}/upload`

// https://submission.hemvip.workers.dev/api/start-upload
export const START_UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_API_ENDPOINT}/api/start-upload`

// https://submission.hemvip.workers.dev/api/upload-part
export const UPLOAD_PART_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_API_ENDPOINT}/api/upload-part`

// https://submission.hemvip.workers.dev/api/complete-upload
export const COMPLETE_UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_API_ENDPOINT}/api/complete-upload`

// ************************ VIDEO ************************
// https://video.hemvip.workers.dev/api/upload
export const VIDEO_UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_VIDEO_API_ENDPOINT}/upload`

// https://video.hemvip.workers.dev/api/video-start-upload
export const VIDEO_START_UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_VIDEO_API_ENDPOINT}/api/start-upload`

// https://video.hemvip.workers.dev/api/video-upload-part
export const VIDEO_UPLOAD_PART_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_VIDEO_API_ENDPOINT}/api/upload-part`

// https://video.hemvip.workers.dev/api/video-complete-upload
export const VIDEO_COMPLETE_UPLOAD_API_ENDPOINT = `${process.env.NEXT_PUBLIC_UPLOAD_VIDEO_API_ENDPOINT}/api/complete-upload`

export const SYSTEM_TYPES = {
  "pairwise-human-likeness": "pairwise human-likeness studies",
  "pairwise-emotion-studies": "pairwise emotion studies",
  "mismatch-speech-studies": "mismatch speech studies",
  "mismatch-emotion-studies": "mismatch emotion studies",
}
