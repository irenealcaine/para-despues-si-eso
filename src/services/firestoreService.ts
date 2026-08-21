import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore"
import { getDb } from "../firebase/config"
import type { LinkCategory } from "../constants/categories"
import type { LinkPlatform, LinkType, SavedLink } from "../types/link"

export type LinkInput = {
  userId: string
  url: string
  platform: LinkPlatform
  type: LinkType
  title: string
  category: LinkCategory
}

export function subscribeToLinks(
  userId: string,
  callback: (links: SavedLink[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  const linksQuery = query(
    collection(getDb(), "links"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
  )

  return onSnapshot(
    linksQuery,
    (snapshot) => {
      const links: SavedLink[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<SavedLink, "id">),
      }))
      callback(links)
    },
    onError,
  )
}

export async function addLink(input: LinkInput): Promise<void> {
  const linkRef = collection(getDb(), "links")
  await addDoc(linkRef, {
    userId: input.userId,
    url: input.url,
    platform: input.platform,
    type: input.type,
    title: input.title,
    category: input.category,
    createdAt: serverTimestamp() as Timestamp,
  })
}

export async function deleteLink(linkId: string): Promise<void> {
  await deleteDoc(doc(getDb(), "links", linkId))
}