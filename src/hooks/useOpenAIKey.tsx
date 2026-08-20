import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { validateApiKey } from "../services/openaiService"
import { openAIKeyStore } from "../services/secureStoreService"

type OpenAIKeyContextValue = {
  hasApiKey: boolean
  keyHint: string | null
  initializing: boolean
  saveKey: (key: string) => Promise<void>
  deleteKey: () => Promise<void>
}

const OpenAIKeyContext = createContext<OpenAIKeyContextValue | undefined>(undefined)

function maskKey(key: string): string | null {
  if (key.length === 0) return null
  const suffix = key.slice(-4)
  return `••••••••${suffix}`
}

export function OpenAIKeyProvider({ children }: { children: ReactNode }) {
  const [hasApiKey, setHasApiKey] = useState(false)
  const [keyHint, setKeyHint] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    openAIKeyStore
      .get()
      .then((key) => {
        if (key && key.length > 0) {
          setHasApiKey(true)
          setKeyHint(maskKey(key))
        }
      })
      .finally(() => setInitializing(false))
  }, [])

  const value: OpenAIKeyContextValue = {
    hasApiKey,
    keyHint,
    initializing,
    saveKey: async (key) => {
      const trimmed = key.trim()
      await validateApiKey(trimmed)
      await openAIKeyStore.set(trimmed)
      setHasApiKey(true)
      setKeyHint(maskKey(trimmed))
    },
    deleteKey: async () => {
      await openAIKeyStore.delete()
      setHasApiKey(false)
      setKeyHint(null)
    },
  }

  return <OpenAIKeyContext.Provider value={value}>{children}</OpenAIKeyContext.Provider>
}

export function useOpenAIKey(): OpenAIKeyContextValue {
  const context = useContext(OpenAIKeyContext)
  if (!context) {
    throw new Error("useOpenAIKey must be used within an OpenAIKeyProvider")
  }
  return context
}