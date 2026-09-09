import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
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
  // Sin orderBy en servidor: el combo where + orderBy exige un índice
  // compuesto en Firestore y la lista se quedaba en error en web.
  // Ordenamos en cliente por createdAt desc.
  const linksQuery = query(collection(getDb(), "links"), where("userId", "==", userId))

  return onSnapshot(
    linksQuery,
    (snapshot) => {
      const links: SavedLink[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<SavedLink, "id">),
      }))
      links.sort((a, b) => getCreatedAtMillis(b) - getCreatedAtMillis(a))
      callback(links)
    },
    onError,
  )
}

function getCreatedAtMillis(link: SavedLink): number {
  const createdAt = link.createdAt as unknown
  if (!createdAt) return 0
  if (typeof (createdAt as Timestamp).toMillis === "function") {
    return (createdAt as Timestamp).toMillis()
  }
  if (typeof createdAt === "object" && createdAt !== null && "seconds" in createdAt) {
    return Number((createdAt as { seconds: number }).seconds) * 1000
  }
  return 0
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

export async function updateLinkTitle(
  linkId: string,
  title: string,
): Promise<void> {
  const trimmed = title.trim()
  if (!trimmed) {
    throw new Error("El título no puede estar vacío.")
  }
  await updateDoc(doc(getDb(), "links", linkId), { title: trimmed })
}