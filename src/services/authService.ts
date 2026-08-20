import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth"
import { getAuthInstance } from "../firebase/config"

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(getAuthInstance(), callback)
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(
    getAuthInstance(),
    email.trim(),
    password,
  )
  return credential.user
}

export async function signUp(email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(
    getAuthInstance(),
    email.trim(),
    password,
  )
  return credential.user
}

export async function signOutUser(): Promise<void> {
  await signOut(getAuthInstance())
}