import type { Timestamp } from "firebase/firestore"
import type { AppLanguage } from "../i18n/translations"

export function formatTimestamp(
  timestamp: Timestamp | null | undefined,
  lang: AppLanguage = "es",
): string {
  if (!timestamp?.toDate) return ""
  try {
    const date = timestamp.toDate()
    if (lang === "en") {
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const year = date.getFullYear()
      let hours = date.getHours()
      const minutes = String(date.getMinutes()).padStart(2, "0")
      const ampm = hours >= 12 ? "PM" : "AM"
      hours = hours % 12 || 12
      return `${month}/${day}/${year} ${hours}:${minutes} ${ampm}`
    }
    const day = String(date.getDate()).padStart(2, "0")
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const year = date.getFullYear()
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${day}/${month}/${year} ${hours}:${minutes}`
  } catch {
    return ""
  }
}