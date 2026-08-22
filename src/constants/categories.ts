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

export type LinkCategory = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is LinkCategory {
  return CATEGORIES.includes(value as LinkCategory)
}

export const DEFAULT_CATEGORY: LinkCategory = "Otros"