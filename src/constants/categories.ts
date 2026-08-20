export const CATEGORIES = [
  "Programming",
  "Food",
  "Fashion",
  "Travel",
  "Home",
  "Shopping",
  "Entertainment",
  "Ideas",
  "Other",
] as const

export type LinkCategory = (typeof CATEGORIES)[number]

export function isCategory(value: string): value is LinkCategory {
  return CATEGORIES.includes(value as LinkCategory)
}

export const DEFAULT_CATEGORY: LinkCategory = "Other"