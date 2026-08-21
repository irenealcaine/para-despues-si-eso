import {
  CATEGORIES,
  DEFAULT_CATEGORY,
  isCategory,
  type LinkCategory,
} from "../constants/categories"
import { AppError } from "../utils/errors"
import type { UrlMetadata } from "./urlMetadataService"

export type AiLinkInfo = {
  title: string
  category: LinkCategory
}

type OpenAiInput = {
  url: string
  platform: string
  metadata: UrlMetadata
}

const OPENAI_URL = "https://api.openai.com/v1/chat/completions"
const MODEL = "gpt-4o-mini"
const MAX_TITLE_LENGTH = 120

const SYSTEM_PROMPT = `You extract minimal information from a saved link.
Return ONLY a JSON object with these two keys:
- "title": a short, descriptive title of the content (max 10 words). Use the language of the available content when it can be detected, otherwise English. Never invent content.
- "category": exactly one of these categories: ${CATEGORIES.join(", ")}.
Choose the single best matching category. Never create a new category. If nothing fits, use "Other".`

export async function validateApiKey(apiKey: string): Promise<void> {
  let response: Response
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1,
        messages: [{ role: "user", content: "ping" }],
      }),
    })
  } catch {
    throw new AppError("NETWORK_ERROR", "La solicitud a OpenAI falló")
  }

  if (response.status === 401) {
    throw new AppError("INVALID_API_KEY", "OpenAI rechazó la API key")
  }
  if (!response.ok) {
    throw new AppError("OPENAI_ERROR", `Error de OpenAI ${response.status}`)
  }
}

export async function generateLinkInfo(
  apiKey: string,
  input: OpenAiInput,
): Promise<AiLinkInfo | null> {
  const body = {
    model: MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: JSON.stringify({
          url: input.url,
          platform: input.platform,
          availableInfo: {
            title: input.metadata.title,
            description: input.metadata.description,
          },
        }),
      },
    ],
  }

  let response: Response
  try {
    response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new AppError("NETWORK_ERROR", "La solicitud a OpenAI falló")
  }

  if (!response.ok) {
    if (response.status === 401) {
    throw new AppError("INVALID_API_KEY", "OpenAI rechazó la API key")
    }
    throw new AppError("OPENAI_ERROR", `Error de OpenAI ${response.status}`)
  }

  try {
    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    const content = data.choices?.[0]?.message?.content
    if (!content) return null

    const parsed = JSON.parse(content) as {
      title?: unknown
      category?: unknown
    }

    const title =
      typeof parsed.title === "string" ? parsed.title.trim().slice(0, MAX_TITLE_LENGTH) : ""
    const category =
      typeof parsed.category === "string" && isCategory(parsed.category)
        ? parsed.category
        : DEFAULT_CATEGORY

    if (title.length === 0) return null
    return { title, category }
  } catch {
    return null
  }
}