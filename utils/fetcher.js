import { API_ENDPOINT, UPLOAD_API_ENDPOINT } from "@/config/constants"

export const apiFetcher = (...args) =>
  fetch(...args, { credentials: "include" }).then((res) => res.json())

// Fetches from the `upload` worker (R2 storage) rather than the `geneaapi` worker.
export const uploadFetcherData = (endpoint) =>
  fetch(`${UPLOAD_API_ENDPOINT}${endpoint}`, { credentials: "include" })
    .then((res) => res.json())
    .then((data) => data.data)

export const apiFetcherData = (...args) => 
  fetch(`${API_ENDPOINT}${args[0]}`, {
    credentials: "include" }, ...args).then((res) => res.json().then((data) => data.data))

// export const apiFetcher = (endpoint, options = {}) => 
//   fetch(`${API_ENDPOINT}${args[0]}`, { 
//     credentials: "include", ...options }).then((res) => res.json().then((data) => data.data))

export const apiUpdate = (endpoint, data, ...args) =>
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    ...args,
  }).then((res) => res.json())

export const apiUpdateData = (endpoint, data, ...args) =>
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    ...args,
  })
    .then((res) => res.json())
    .then((data) => data)

export const apiPatch = (endpoint, data, ...args) =>
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    ...args,
  }).then((res) => res.json())

export const apiPost = (endpoint, data, ...args) =>
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    ...args,
  }).then((res) => res.json())
