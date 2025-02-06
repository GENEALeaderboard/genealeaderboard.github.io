export const fetcher = (...args) =>
  fetch(...args, { credentials: "include" }).then((res) => res.json())

export const apiFetcher = (...args) =>
  fetch(`${env.NEXT_PUBLIC_API_ENDPOINT}/${args[0]}`, { credentials: "include" }).then((res) =>
    res.json()
  )
