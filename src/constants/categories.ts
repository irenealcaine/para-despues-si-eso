import type { AppLanguage } from "../i18n/translations"

export const CATEGORIES = [
  "Programación",
  "Comida",
  "Moda",
  "Viajes",
  "Casa",
  "Compras",
  "Ocio",
  "Ideas",
  "Otros",
] as const

export type LinkCategory = (typeof CATEGORIES)[number] | (typeof CATEGORIES_EN)[number]

export const CATEGORIES_EN = [
  "Programming",
  "Food",
  "Fashion",
  "Travel",
  "Home",
  "Shopping",
  "Leisure",
  "Ideas",
  "Others",
] as const

const ES_TO_EN: Record<string, string> = {
  Programación: "Programming",
  Comida: "Food",
  Moda: "Fashion",
  Viajes: "Travel",
  Casa: "Home",
  Compras: "Shopping",
  Ocio: "Leisure",
  Ideas: "Ideas",
  Otros: "Others",
}

const EN_TO_ES: Record<string, string> = Object.fromEntries(
  Object.entries(ES_TO_EN).map(([es, en]) => [en, es]),
)

export function getCategories(lang: AppLanguage = "es"): readonly string[] {
  return lang === "en" ? CATEGORIES_EN : CATEGORIES
}

export function getDefaultCategory(lang: AppLanguage = "es"): string {
  return lang === "en" ? "Others" : "Otros"
}

export function getCategoryLabel(category: string, lang: AppLanguage = "es"): string {
  if (lang === "en") {
    if ((CATEGORIES_EN as readonly string[]).includes(category)) return category
    return ES_TO_EN[category] ?? category
  }
  if ((CATEGORIES as readonly string[]).includes(category)) return category
  return EN_TO_ES[category] ?? category
}

export function normalizeCategoryForLanguage(
  category: string,
  lang: AppLanguage = "es",
): string {
  return getCategoryLabel(category, lang)
}

export function isCategory(value: string): value is LinkCategory {
  return (
    (CATEGORIES as readonly string[]).includes(value) ||
    (CATEGORIES_EN as readonly string[]).includes(value)
  )
}

export const DEFAULT_CATEGORY: LinkCategory = "Otros"