import { API_ENDPOINT } from "@/config/constants"

export const fetcher = (...args) =>
  fetch(...args, { credentials: "include" }).then((res) => res.json())

export const apiFetcher = (...args) =>
  fetch(`${API_ENDPOINT}/${args[0]}`, { credentials: "include" }).then((res) =>
    res.json()
  )
