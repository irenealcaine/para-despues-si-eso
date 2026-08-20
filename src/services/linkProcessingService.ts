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
  if (!isValidHttpUrl(rawUrl)) {
    throw new AppError("INVALID_URL", "The provided text is not a valid URL")
  }

  const url = normalizeUrl(rawUrl)
  const warnings: string[] = []

  const { platform } = detectPlatform(url)

  const metadata = await fetchMetadataBestEffort(url, warnings)

  const apiKey = await openAIKeyStore.get()
  if (!apiKey) {
    throw new AppError("NO_API_KEY", "No OpenAI API key configured")
  }

  const ai = await generateInfoBestEffort(apiKey, url, platform, metadata, warnings)

  const title = ai.title ?? metadata.title ?? titleFromUrl(url)
  const category = ai.category ?? DEFAULT_CATEGORY

  if (!ai.title && !metadata.title) {
    warnings.push("No metadata available. A title was generated from the URL.")
  }

  const type: LinkType =
    metadata.type !== "unknown" ? metadata.type : inferType(url)

  await addLink({
    userId,
    url,
    platform,
    type,
    title,
    category,
  })

  return { title, category, warnings }
}

async function fetchMetadataBestEffort(
  url: string,
  warnings: string[],
): Promise<UrlMetadata> {
  try {
    return await fetchUrlMetadata(url)
  } catch {
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