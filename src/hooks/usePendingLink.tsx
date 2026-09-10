import AsyncStorage from "@react-native-async-storage/async-storage"
import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AppLanguage } from "../i18n/translations"
import { processAndSaveLink } from "../services/linkProcessingService"
import { AppError, getErrorMessage } from "../utils/errors"

export type BannerType = "info" | "success" | "error"

type PendingLinkContextValue = {
  pendingUrl: string | null
  processing: boolean
  message: string | null
  messageType: BannerType
  setPendingUrl: (url: string) => Promise<void>
  clearPendingUrl: () => Promise<void>
  processPendingUrl: (userId: string, lang?: AppLanguage) => Promise<void>
  showMessage: (message: string, type?: BannerType) => void
  dismissMessage: () => void
}

const PENDING_URL_KEY = "pending_share_url"

const PendingLinkContext = createContext<PendingLinkContextValue | undefined>(undefined)

export function PendingLinkProvider({ children }: { children: ReactNode }) {
  const [pendingUrl, setPendingUrlState] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<BannerType>("info")

  useEffect(() => {
    AsyncStorage.getItem(PENDING_URL_KEY).then((stored) => {
      if (stored) {
        setPendingUrlState(stored)
      }
    }).catch(() => {})
  }, [])

  const setPendingUrl = async (url: string) => {
    setPendingUrlState(url)
    try {
      await AsyncStorage.setItem(PENDING_URL_KEY, url)
    } catch {
      // non-critical
    }
  }

  const clearPendingUrl = async () => {
    setPendingUrlState(null)
    try {
      await AsyncStorage.removeItem(PENDING_URL_KEY)
    } catch {
      // non-critical
    }
  }

  const showMessage = (nextMessage: string, type: BannerType = "info") => {
    setMessage(nextMessage)
    setMessageType(type)
  }

  const dismissMessage = () => {
    setMessage(null)
  }

  const processPendingUrl = async (userId: string, lang: AppLanguage = "es") => {
    if (!pendingUrl || processing) return
    setProcessing(true)
    try {
      const result = await processAndSaveLink(pendingUrl, userId, lang)
      await clearPendingUrl()
      if (result.warnings.length > 0) {
        const prefix = lang === "en" ? "Link saved." : "Enlace guardado."
        showMessage(`${prefix} ${result.warnings.join(" ")}`, "success")
      } else {
        showMessage(lang === "en" ? "Link saved" : "Enlace guardado", "success")
      }
    } catch (error) {
      console.warn("[PendingLink] Process error:", error)
      if (error instanceof AppError && error.code === "INVALID_URL") {
        await clearPendingUrl()
      }
      showMessage(getErrorMessage(error, lang), "error")
    } finally {
      setProcessing(false)
    }
  }

  const value: PendingLinkContextValue = {
    pendingUrl,
    processing,
    message,
    messageType,
    setPendingUrl,
    clearPendingUrl,
    processPendingUrl,
    showMessage,
    dismissMessage,
  }

  return <PendingLinkContext.Provider value={value}>{children}</PendingLinkContext.Provider>
}

export function usePendingLink(): PendingLinkContextValue {
  const context = useContext(PendingLinkContext)
  if (!context) {
    throw new Error("usePendingLink must be used within a PendingLinkProvider")
  }
  return context
}
