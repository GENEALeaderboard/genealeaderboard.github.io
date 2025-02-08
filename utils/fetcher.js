import { API_ENDPOINT } from "@/config/constants"

export const fetcher = (...args) => fetch(...args, { credentials: "include" }).then((res) => res.json())

export const apiFetcher = (...args) => fetch(`${API_ENDPOINT}${args[0]}`, { credentials: "include" }, ...args).then((res) => res.json().then((data) => data.data))

// export const apiFetcher = (endpoint, options = {}) => fetch(`${API_ENDPOINT}${args[0]}`, { credentials: "include", ...options }).then((res) => res.json().then((data) => data.data))

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

export const apiInsert = (endpoint, data, ...args) =>
  fetch(`${API_ENDPOINT}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
    credentials: "include",
    ...args,
  }).then((res) => res.json())
