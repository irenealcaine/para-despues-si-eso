import { useEffect, useState } from "react"
import { subscribeToLinks } from "../services/firestoreService"
import type { SavedLink } from "../types/link"
import { getErrorMessage } from "../utils/errors"
import { useLanguage } from "./useLanguage"

export function useSavedLinks(userId: string) {
  const { language } = useLanguage()
  const [links, setLinks] = useState<SavedLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLinks([])
      setLoading(false)
      setError(null)
      return
    }
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeToLinks(
      userId,
      (nextLinks) => {
        setLinks(nextLinks)
        setLoading(false)
      },
      (loadError) => {
        setError(getErrorMessage(loadError, language))
        setLoading(false)
      },
    )
    return unsubscribe
  }, [userId, language])

  return { links, loading, error }
}