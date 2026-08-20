import { useEffect, useState } from "react"
import { subscribeToLinks } from "../services/firestoreService"
import type { SavedLink } from "../types/link"
import { getErrorMessage } from "../utils/errors"

export function useSavedLinks(userId: string) {
  const [links, setLinks] = useState<SavedLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeToLinks(
      userId,
      (nextLinks) => {
        setLinks(nextLinks)
        setLoading(false)
      },
      (loadError) => {
        setError(getErrorMessage(loadError))
        setLoading(false)
      },
    )
    return unsubscribe
  }, [userId])

  return { links, loading, error }
}