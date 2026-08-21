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

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
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

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code]
  }

  const message = error instanceof Error ? error.message : String(error)
  if (/network|fetch|timeout/i.test(message)) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  if (/firebase|permission|not-found|unavailable/i.test(message)) {
    return ERROR_MESSAGES.FIREBASE_ERROR
  }
  return ERROR_MESSAGES.OPENAI_ERROR
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
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

export function getAuthErrorMessage(error: unknown): string {
  const code =
    error && typeof error === "object" && "code" in error
      ? String((error as { code: unknown }).code)
      : ""
  if (code in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[code]
  }
  if (code.startsWith("auth/")) {
    return "No se pudo completar la autenticación. Inténtalo de nuevo."
  }
  return getErrorMessage(error)
}