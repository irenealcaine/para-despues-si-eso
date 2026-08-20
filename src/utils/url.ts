const URL_REGEX =
  /https?:\/\/[^\s<>"']+/i

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim()
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  return `https://${trimmed}`
}

export function isValidHttpUrl(raw: string): boolean {
  try {
    const url = new URL(normalizeUrl(raw))
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

export function extractUrl(text: string): string | null {
  const match = text.match(URL_REGEX)
  return match ? match[0] : null
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

export function titleFromUrl(raw: string): string {
  let url: URL
  try {
    url = new URL(normalizeUrl(raw))
  } catch {
    return normalizeUrl(raw)
  }

  const meaningfulSegments = url.pathname
    .split("/")
    .map(decodeSegment)
    .filter((segment) => segment.length > 0 && segment !== "/")

  if (meaningfulSegments.length === 0) {
    return url.hostname.replace(/^www\./, "")
  }

  const lastSegment = meaningfulSegments[meaningfulSegments.length - 1]
  return lastSegment.replace(/[-_]+/g, " ").trim() || url.hostname
}