import { useEffect, useMemo, useRef } from "react"
import { useShareIntentContext } from "expo-share-intent"
import { useAuth } from "./useAuth"
import { useLanguage } from "./useLanguage"
import { useOpenAIKey } from "./useOpenAIKey"
import { usePendingLink } from "./usePendingLink"
import { extractUrl } from "../utils/url"
import { navigate } from "../navigation/navigationRef"
import { ShareBanner } from "../components/ShareBanner"

export function ShareIntentHandler() {
  const { hasShareIntent, shareIntent, resetShareIntent } =
    useShareIntentContext()
  const { user } = useAuth()
  const { language, t } = useLanguage()
  const { hasApiKey, initializing: keyInitializing } = useOpenAIKey()
  const autoAttemptedUrl = useRef<string | null>(null)
  const {
    pendingUrl,
    processing,
    message,
    messageType,
    setPendingUrl,
    clearPendingUrl,
    processPendingUrl,
    showMessage,
    dismissMessage,
  } = usePendingLink()

  useEffect(() => {
    if (!hasShareIntent) return

    try {
      const rawText = shareIntent?.webUrl ?? shareIntent?.text ?? ""
      const url = extractUrl(rawText)

      if (!url) {
        showMessage(t("shareIncompatible"), "error")
        resetShareIntent()
        return
      }

      autoAttemptedUrl.current = null
      setPendingUrl(url)
      resetShareIntent()

      if (!user) {
        showMessage(t("shareLoginRequired"), "info")
      } else if (!hasApiKey) {
        showMessage(t("shareApiKeyRequired"), "error")
      }
    } catch (err) {
      console.warn("[ShareIntent] Error processing share intent:", err)
      showMessage(t("shareProcessError"), "error")
      resetShareIntent()
    }
  }, [hasShareIntent, shareIntent, user, hasApiKey])

  useEffect(() => {
    if (
      pendingUrl &&
      pendingUrl !== autoAttemptedUrl.current &&
      user &&
      hasApiKey &&
      !processing
    ) {
      autoAttemptedUrl.current = pendingUrl
      processPendingUrl(user.uid, language).catch((err) => {
        console.warn("[ShareIntent] Auto-process failed:", err)
      })
    }
  }, [pendingUrl, user, hasApiKey, processing])

  useEffect(() => {
    if (user && pendingUrl && !hasApiKey) {
      showMessage(t("shareApiKeyRequired"), "error")
    }
  }, [user, pendingUrl, hasApiKey])

  const banner = useMemo(() => {
    if (processing) {
      return { visible: true, processing: true }
    }
    if (message) {
      return { visible: true, processing: false }
    }
    return { visible: false, processing: false }
  }, [processing, message])

  if (!banner.visible) return null

  return (
    <ShareBanner
      message={message ?? t("shareSaving")}
      type={messageType}
      processing={banner.processing}
      onSettingsPress={user && !hasApiKey ? () => navigate("Settings") : undefined}
      onRetryPress={
        user && hasApiKey && pendingUrl && !keyInitializing
          ? () => {
              processPendingUrl(user.uid, language).catch((err) => {
                console.warn("[ShareIntent] Retry failed:", err)
              })
            }
          : undefined
      }
      onDismiss={() => {
        dismissMessage()
        if (message && messageType !== "error") {
          clearPendingUrl()
        }
      }}
    />
  )
}
