import type { Timestamp } from "firebase/firestore"
import type { LinkCategory } from "../constants/categories"

export type LinkPlatform = "youtube" | "instagram" | "twitter" | "threads" | "other"

export type LinkType = "video" | "webpage" | "unknown"

export type SavedLink = {
  id: string
  userId: string
  url: string
  platform: LinkPlatform
  type: LinkType
  title: string
  category: LinkCategory
  createdAt: Timestamp
}