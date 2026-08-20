import type { LinkPlatform, LinkType } from "../types/link"
import { normalizeUrl } from "../utils/url"

export type PlatformDetection = {
  platform: LinkPlatform
  type: LinkType
}

export function detectPlatform(rawUrl: string): PlatformDetection {
  const host = getHostname(rawUrl)

  if (isYouTubeHost(host)) {
    return { platform: "youtube", type: "video" }
  }

  if (isInstagramHost(host)) {
    return { platform: "instagram", type: "unknown" }
  }

  return { platform: "other", type: "unknown" }
}

function getHostname(rawUrl: string): string {
  try {
    return new URL(normalizeUrl(rawUrl)).hostname.toLowerCase()
  } catch {
    return ""
  }
}

function isYouTubeHost(host: string): boolean {
  return (
    host === "youtube.com" ||
    host === "www.youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  )
}

function isInstagramHost(host: string): boolean {
  return (
    host === "instagram.com" ||
    host === "www.instagram.com" ||
    host === "m.instagram.com" ||
    host === "instagr.am"
  )
}