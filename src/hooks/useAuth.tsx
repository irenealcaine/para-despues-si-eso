import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { signIn, signOutUser, signUp, subscribeToAuth } from "../services/authService"

type AuthContextValue = {
  user: User | null
  initializing: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const unsubscribe = subscribeToAuth((nextUser) => {
      setUser(nextUser)
      setInitializing(false)
    })
    return unsubscribe
  }, [])

  const value: AuthContextValue = {
    user,
    initializing,
    signIn: async (email, password) => {
      await signIn(email, password)
    },
    signUp: async (email, password) => {
      await signUp(email, password)
    },
    signOut: async () => {
      await signOutUser()
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}