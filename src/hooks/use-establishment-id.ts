"use client"

import { useState, useEffect } from "react"

interface UserData {
  id: string
  name: string
  email: string
  role: string
  permissions: string[]
  establishmentId: string
}

export function useEstablishmentId(): string | null {
  const [establishmentId, setEstablishmentId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("pedefacil-user")
    if (stored) {
      try {
        const user: UserData = JSON.parse(stored)
        setEstablishmentId(user.establishmentId)
      } catch {}
    }
  }, [])

  return establishmentId
}
