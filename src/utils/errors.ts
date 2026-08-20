export type AppErrorCode =
  | "INVALID_URL"
  | "NO_API_KEY"
  | "INVALID_API_KEY"
  | "OPENAI_ERROR"
  | "FIREBASE_ERROR"
  | "NETWORK_ERROR"
  | "NO_METADATA"
  | "NOT_SUPPORTED"

export class AppError extends Error {
  code: AppErrorCode

  constructor(code: AppErrorCode, message: string) {
    super(message)
    this.name = "AppError"
    this.code = code
  }
}

export const ERROR_MESSAGES: Record<AppErrorCode, string> = {
  INVALID_URL: "The URL is not valid. Check it and try again.",
  NO_API_KEY: "No OpenAI API key configured. Add it in Settings first.",
  INVALID_API_KEY:
    "The OpenAI API key is not valid. Check it in Settings and try again.",
  OPENAI_ERROR: "OpenAI could not process this link right now.",
  FIREBASE_ERROR: "Something went wrong saving the link. Try again.",
  NETWORK_ERROR: "No connection. Check your internet and try again.",
  NO_METADATA: "No additional information could be obtained from this link.",
  NOT_SUPPORTED: "This content type is not supported.",
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
  "auth/invalid-email": "The email address is not valid.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect password.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/email-already-in-use": "There is already an account with this email.",
  "auth/weak-password": "The password must be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "No connection. Check your internet and try again.",
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
    return "Could not complete the authentication. Try again."
  }
  return getErrorMessage(error)
}