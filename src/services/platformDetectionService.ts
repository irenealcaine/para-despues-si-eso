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

  if (isTwitterHost(host)) {
    return { platform: "twitter", type: "webpage" }
  }

  if (isThreadsHost(host)) {
    return { platform: "threads", type: "webpage" }
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

function isTwitterHost(host: string): boolean {
  return (
    host === "x.com" ||
    host === "www.x.com" ||
    host === "twitter.com" ||
    host === "www.twitter.com" ||
    host === "m.twitter.com" ||
    host === "mobile.twitter.com"
  )
}

function isThreadsHost(host: string): boolean {
  return (
    host === "threads.net" ||
    host === "www.threads.net" ||
    host === "threads.app" ||
    host === "www.threads.app"
  )
}