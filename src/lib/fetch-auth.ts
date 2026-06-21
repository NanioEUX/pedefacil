export function getToken(): string | null {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("pedefacil-user")
    if (!stored) return null
    const data = JSON.parse(stored)
    return data.token || null
  } catch {
    return null
  }
}

export async function fetchAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const token = getToken()
  const headers = new Headers(init?.headers)
  if (token) {
    headers.set("Authorization", `Bearer ${token}`)
  }
  return fetch(input, { ...init, headers, cache: "no-store" })
}
