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
    throw new AppError("INVALID_URL", "El texto proporcionado no es una URL válida")
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
    warnings.push("Metadatos no disponibles.")
  }

  let apiKey: string | null = null
  try {
    apiKey = await openAIKeyStore.get()
    console.log("[ProcessLink] API key:", apiKey ? "found" : "missing")
  } catch (err) {
    console.warn("[ProcessLink] SecureStore failed:", err)
    throw new AppError("NO_API_KEY", "No se pudo leer la API key. Revisa Ajustes.")
  }

  if (!apiKey) {
    throw new AppError("NO_API_KEY", "No hay API key de OpenAI configurada")
  }

  let ai = { title: null as string | null, category: null as LinkCategory | null }
  try {
    ai = await generateInfoBestEffort(apiKey, url, platform, metadata, warnings)
    console.log("[ProcessLink] AI result:", ai)
  } catch (err) {
    console.warn("[ProcessLink] AI failed:", err)
    warnings.push("OpenAI no pudo procesar este enlace.")
  }

  const title = ai.title ?? metadata.title ?? titleFromUrl(url)
  const category = ai.category ?? DEFAULT_CATEGORY

  if (!ai.title && !metadata.title) {
    warnings.push("Metadatos no disponibles. Se generó un título a partir de la URL.")
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
    throw new AppError("SAVE_FAILED", "No se pudo guardar el enlace. Comprueba tu conexión.")
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
    warnings.push("No se pudo obtener información adicional de este enlace.")
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
      warnings.push("OpenAI no pudo describir este enlace. Se usó un título alternativo.")
      return { title: null, category: null }
    }
    return { title: ai.title, category: ai.category }
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_API_KEY") {
      warnings.push("La API key de OpenAI no es válida. Revísala en Ajustes.")
    } else {
      warnings.push("OpenAI no pudo procesar este enlace. Se usó un título alternativo.")
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
