import type { LinkType } from "../types/link"
import { normalizeUrl } from "../utils/url"
import { detectPlatform } from "./platformDetectionService"

export type UrlMetadata = {
  title: string | null
  description: string | null
  image: string | null
  type: LinkType
}

const FETCH_TIMEOUT_MS = 8000
const MAX_BODY_LENGTH = 200000

export async function fetchUrlMetadata(rawUrl: string): Promise<UrlMetadata> {
  const url = normalizeUrl(rawUrl)
  const { platform } = detectPlatform(url)

  if (platform === "youtube") {
    return fetchYouTubeMetadata(url)
  }
  return fetchHtmlMetadata(url)
}

async function fetchYouTubeMetadata(url: string): Promise<UrlMetadata> {
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
    url,
  )}&format=json`

  try {
    const response = await fetchWithTimeout(oembedUrl)
    const data = (await response.json()) as {
      title?: string
      author_name?: string
      thumbnail_url?: string
    }
    return {
      title: data.title ?? null,
      description: data.author_name ? `By ${data.author_name}` : null,
      image: data.thumbnail_url ?? null,
      type: "video",
    }
  } catch {
    return emptyMetadata("video")
  }
}

async function fetchHtmlMetadata(url: string): Promise<UrlMetadata> {
  try {
    const response = await fetchWithTimeout(url)
    if (!response.ok) {
      return emptyMetadata("unknown")
    }
    const html = await response.text()
    const slice = html.slice(0, MAX_BODY_LENGTH)

    const title = getMetaContent(slice, "og:title") ?? getTitleTag(slice)
    const description =
      getMetaContent(slice, "og:description") ??
      getMetaContent(slice, "description")
    const image = getMetaContent(slice, "og:image")
    const ogType = getMetaContent(slice, "og:type")
    const type = ogType?.startsWith("video") ? "video" : "webpage"

    return { title, description, image, type }
  } catch {
    return emptyMetadata("unknown")
  }
}

function emptyMetadata(type: LinkType): UrlMetadata {
  return { title: null, description: null, image: null, type }
}

async function fetchWithTimeout(url: string): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (Linux; Android 14)" },
    })
  } finally {
    clearTimeout(timeout)
  }
}

function getMetaContent(html: string, name: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${name}["'][^>]*content=["']([^"']*)["']`,
      "i",
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${name}["']`,
      "i",
    ),
  ]
  for (const pattern of patterns) {
    const match = html.match(pattern)
    if (match && match[1].trim().length > 0) {
      return decodeHtml(match[1].trim())
    }
  }
  return null
}

function getTitleTag(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return null
  const title = decodeHtml(match[1].replace(/\s+/g, " ").trim())
  return title.length > 0 ? title : null
}

function decodeHtml(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&apos;/g, "'")
}