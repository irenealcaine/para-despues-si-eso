import type { AppLanguage } from "../i18n/translations"

export type AppErrorCode =
  | "INVALID_URL"
  | "NO_API_KEY"
  | "INVALID_API_KEY"
  | "OPENAI_ERROR"
  | "FIREBASE_ERROR"
  | "NETWORK_ERROR"
  | "NO_METADATA"
  | "NOT_SUPPORTED"
  | "SAVE_FAILED"

export class AppError extends Error {
  code: AppErrorCode

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = "AppError"
    this.code = code
  }
}

const ERROR_MESSAGES_ES: Record<AppErrorCode, string> = {
  INVALID_URL: "La URL no es válida. Revísala e inténtalo de nuevo.",
  NO_API_KEY: "No hay API key de OpenAI configurada. Añádela en Ajustes.",
  INVALID_API_KEY:
    "La API key de OpenAI no es válida. Revísala en Ajustes e inténtalo de nuevo.",
  OPENAI_ERROR: "OpenAI no pudo procesar este enlace ahora mismo.",
  FIREBASE_ERROR: "Algo falló al guardar el enlace. Inténtalo de nuevo.",
  NETWORK_ERROR: "Sin conexión. Comprueba tu internet e inténtalo de nuevo.",
  NO_METADATA: "No se pudo obtener información adicional de este enlace.",
  NOT_SUPPORTED: "Este tipo de contenido no es compatible.",
  SAVE_FAILED: "No se pudo guardar el enlace. Comprueba tu conexión.",
}

const ERROR_MESSAGES_EN: Record<AppErrorCode, string> = {
  INVALID_URL: "The URL is not valid. Check it and try again.",
  NO_API_KEY: "No OpenAI API key configured. Add it in Settings.",
  INVALID_API_KEY:
    "The OpenAI API key is not valid. Check it in Settings and try again.",
  OPENAI_ERROR: "OpenAI could not process this link right now.",
  FIREBASE_ERROR: "Something failed while saving the link. Try again.",
  NETWORK_ERROR: "No connection. Check your internet and try again.",
  NO_METADATA: "Could not fetch additional info for this link.",
  NOT_SUPPORTED: "This type of content is not supported.",
  SAVE_FAILED: "Could not save the link. Check your connection.",
}

/** Kept for backwards compatibility (Spanish default). */
export const ERROR_MESSAGES: Record<AppErrorCode, string> = ERROR_MESSAGES_ES

export function getErrorMessages(lang: AppLanguage = "es"): Record<AppErrorCode, string> {
  return lang === "en" ? ERROR_MESSAGES_EN : ERROR_MESSAGES_ES
}

export function getErrorMessage(error: unknown, lang: AppLanguage = "es"): string {
  const messages = getErrorMessages(lang)
  if (error instanceof AppError) {
    return messages[error.code]
  }

  const message = error instanceof Error ? error.message : String(error)
  if (/network|fetch|timeout/i.test(message)) {
    return messages.NETWORK_ERROR
  }
  if (/firebase|firestore|permission|not-found|unavailable|failed-precondition|requires an index/i.test(message)) {
    return messages.FIREBASE_ERROR
  }
  return messages.OPENAI_ERROR
}

const AUTH_ERROR_MESSAGES_ES: Record<string, string> = {
  "auth/invalid-email": "La dirección de email no es válida.",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada.",
  "auth/user-not-found": "No se encontró cuenta con este email.",
  "auth/wrong-password": "Contraseña incorrecta.",
  "auth/invalid-credential": "Email o contraseña incorrectos.",
  "auth/email-already-in-use": "Ya existe una cuenta con este email.",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.",
  "auth/too-many-requests": "Demasiados intentos. Inténtalo más tarde.",
  "auth/network-request-failed": "Sin conexión. Comprueba tu internet e inténtalo de nuevo.",
}

const AUTH_ERROR_MESSAGES_EN: Record<string, string> = {
  "auth/invalid-email": "The email address is not valid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "An account already exists with this email.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
}

const AUTH_FALLBACK_ES = "No se pudo completar la autenticación. Inténtalo de nuevo."
const AUTH_FALLBACK_EN = "Could not complete authentication. Try again."

export function getAuthErrorMessage(error: unknown, lang: AppLanguage = "es"): string {
  const messages = lang === "en" ? AUTH_ERROR_MESSAGES_EN : AUTH_ERROR_MESSAGES_ES
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : ""
  if (code in messages) {
    return messages[code]
  }
  if (code.startsWith("auth/")) {
    return lang === "en" ? AUTH_FALLBACK_EN : AUTH_FALLBACK_ES
  }
  return getErrorMessage(error, lang)
}