import {
  DEFAULT_CATEGORY,
  type LinkCategory,
} from "../constants/categories"
import type { LinkType } from "../types/link"
import { AppError } from "../utils/errors"
import { isValidHttpUrl, normalizeUrl, titleFromUrl } from "../utils/url"
import { addLink } from "./firestoreService"
import { generateLinkInfo } from "./openaiService"
import { detectPlatform } from "./platformDetectionService"
import { openAIKeyStore } from "./secureStoreService"
import { fetchUrlMetadata, type UrlMetadata } from "./urlMetadataService"

export type ProcessLinkResult = {
  title: string
  category: LinkCategory
  warnings: string[]
}

export async function processAndSaveLink(
  rawUrl: string,
  userId: string,
): Promise<ProcessLinkResult> {
  console.log("[ProcessLink] Starting for:", rawUrl)

  if (!isValidHttpUrl(rawUrl)) {
    throw new AppError("INVALID_URL", "The provided text is not a valid URL")
  }

  const url = normalizeUrl(rawUrl)
  const warnings: string[] = []

  console.log("[ProcessLink] Normalized URL:", url)

  const { platform } = detectPlatform(url)
  console.log("[ProcessLink] Platform:", platform)

  let metadata: UrlMetadata
  try {
    metadata = await fetchMetadataBestEffort(url, warnings)
    console.log("[ProcessLink] Metadata OK, title:", metadata.title)
  } catch (err) {
    console.warn("[ProcessLink] Metadata failed:", err)
    metadata = { title: null, description: null, image: null, type: "unknown" }
    warnings.push("No metadata available.")
  }

  let apiKey: string | null = null
  try {
    apiKey = await openAIKeyStore.get()
    console.log("[ProcessLink] API key:", apiKey ? "found" : "missing")
  } catch (err) {
    console.warn("[ProcessLink] SecureStore failed:", err)
    throw new AppError("NO_API_KEY", "Could not read API key. Check Settings.")
  }

  if (!apiKey) {
    throw new AppError("NO_API_KEY", "No OpenAI API key configured")
  }

  let ai = { title: null as string | null, category: null as LinkCategory | null }
  try {
    ai = await generateInfoBestEffort(apiKey, url, platform, metadata, warnings)
    console.log("[ProcessLink] AI result:", ai)
  } catch (err) {
    console.warn("[ProcessLink] AI failed:", err)
    warnings.push("OpenAI could not process this link.")
  }

  const title = ai.title ?? metadata.title ?? titleFromUrl(url)
  const category = ai.category ?? DEFAULT_CATEGORY

  if (!ai.title && !metadata.title) {
    warnings.push("No metadata available. A title was generated from the URL.")
  }

  const type: LinkType =
    metadata.type !== "unknown" ? metadata.type : inferType(url)

  console.log("[ProcessLink] Saving to Firestore:", { title, category, type })

  try {
    await addLink({
      userId,
      url,
      platform,
      type,
      title,
      category,
    })
    console.log("[ProcessLink] Saved OK")
  } catch (err) {
    console.warn("[ProcessLink] Firestore save failed:", err)
    throw new AppError("SAVE_FAILED", "Could not save the link. Check your connection.")
  }

  return { title, category, warnings }
}

async function fetchMetadataBestEffort(
  url: string,
  warnings: string[],
): Promise<UrlMetadata> {
  try {
    return await fetchUrlMetadata(url)
  } catch (err) {
    console.warn("[ProcessLink] fetchMetadata error:", err)
    warnings.push("No additional information could be obtained for this link.")
    return { title: null, description: null, image: null, type: "unknown" }
  }
}

async function generateInfoBestEffort(
  apiKey: string,
  url: string,
  platform: string,
  metadata: UrlMetadata,
  warnings: string[],
) {
  try {
    const ai = await generateLinkInfo(apiKey, { url, platform, metadata })
    if (!ai) {
      warnings.push("OpenAI could not describe this link. A fallback title was used.")
      return { title: null, category: null }
    }
    return { title: ai.title, category: ai.category }
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_API_KEY") {
      warnings.push("The OpenAI API key is invalid. Check it in Settings.")
    } else {
      warnings.push("OpenAI could not process this link. A fallback title was used.")
    }
    return { title: null, category: null }
  }
}

function inferType(url: string): LinkType {
  try {
    const host = new URL(url).hostname.toLowerCase()
    if (/(youtube|youtu\.be|vimeo|twitch|tiktok|dailymotion)/.test(host)) {
      return "video"
    }
    return "webpage"
  } catch {
    return "unknown"
  }
}
