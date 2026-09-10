import {
  getDefaultCategory,
  type LinkCategory,
} from "../constants/categories"
import type { AppLanguage } from "../i18n/translations"
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

const WARNINGS: Record<AppLanguage, Record<string, string>> = {
  es: {
    noMetadata: "Metadatos no disponibles.",
    noExtraInfo: "No se pudo obtener información adicional de este enlace.",
    aiFailed: "OpenAI no pudo procesar este enlace.",
    aiNoDescription: "OpenAI no pudo describir este enlace. Se usó un título alternativo.",
    aiProcessedFallback: "OpenAI no pudo procesar este enlace. Se usó un título alternativo.",
    invalidApiKey: "La API key de OpenAI no es válida. Revísala en Ajustes.",
    titleFromUrl: "Metadatos no disponibles. Se generó un título a partir de la URL.",
  },
  en: {
    noMetadata: "Metadata unavailable.",
    noExtraInfo: "Could not fetch additional info for this link.",
    aiFailed: "OpenAI could not process this link.",
    aiNoDescription: "OpenAI could not describe this link. A fallback title was used.",
    aiProcessedFallback: "OpenAI could not process this link. A fallback title was used.",
    invalidApiKey: "The OpenAI API key is not valid. Check it in Settings.",
    titleFromUrl: "Metadata unavailable. A title was generated from the URL.",
  },
}

export async function processAndSaveLink(
  rawUrl: string,
  userId: string,
  lang: AppLanguage = "es",
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
    metadata = await fetchMetadataBestEffort(url, warnings, lang)
    console.log("[ProcessLink] Metadata OK, title:", metadata.title)
  } catch (err) {
    console.warn("[ProcessLink] Metadata failed:", err)
    metadata = { title: null, description: null, image: null, type: "unknown" }
    warnings.push(WARNINGS[lang].noMetadata)
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
    ai = await generateInfoBestEffort(apiKey, url, platform, metadata, warnings, lang)
    console.log("[ProcessLink] AI result:", ai)
  } catch (err) {
    console.warn("[ProcessLink] AI failed:", err)
    warnings.push(WARNINGS[lang].aiFailed)
  }

  const title = ai.title ?? metadata.title ?? titleFromUrl(url)
  const category = ai.category ?? (getDefaultCategory(lang) as LinkCategory)

  if (!ai.title && !metadata.title) {
    warnings.push(WARNINGS[lang].titleFromUrl)
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
  lang: AppLanguage = "es",
): Promise<UrlMetadata> {
  try {
    return await fetchUrlMetadata(url)
  } catch (err) {
    console.warn("[ProcessLink] fetchMetadata error:", err)
    warnings.push(WARNINGS[lang].noExtraInfo)
    return { title: null, description: null, image: null, type: "unknown" }
  }
}

async function generateInfoBestEffort(
  apiKey: string,
  url: string,
  platform: string,
  metadata: UrlMetadata,
  warnings: string[],
  lang: AppLanguage = "es",
) {
  try {
    const ai = await generateLinkInfo(apiKey, { url, platform, metadata, language: lang })
    if (!ai) {
      warnings.push(WARNINGS[lang].aiNoDescription)
      return { title: null, category: null }
    }
    return { title: ai.title, category: ai.category }
  } catch (error) {
    if (error instanceof AppError && error.code === "INVALID_API_KEY") {
      warnings.push(WARNINGS[lang].invalidApiKey)
    } else {
      warnings.push(WARNINGS[lang].aiProcessedFallback)
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
