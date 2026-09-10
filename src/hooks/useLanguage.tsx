import AsyncStorage from "@react-native-async-storage/async-storage"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { Platform } from "react-native"
import {
  translate,
  type AppLanguage,
  type TranslationKey,
} from "../i18n/translations"

const LANGUAGE_STORAGE_KEY = "app_language"

type LanguageContextValue = {
  language: AppLanguage
  initializing: boolean
  setLanguage: (lang: AppLanguage) => Promise<void>
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined)

function detectDeviceLanguage(): AppLanguage {
  try {
    let locale: string | undefined
    if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.language) {
      locale = navigator.language
    } else if (typeof Intl !== "undefined" && Intl.DateTimeFormat) {
      locale = Intl.DateTimeFormat().resolvedOptions().locale
    }
    if (locale?.toLowerCase().startsWith("en")) return "en"
  } catch {
    // ignore, default below
  }
  return "es"
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("es")
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)
      .then((stored) => {
        if (stored === "es" || stored === "en") {
          setLanguageState(stored)
        } else {
          setLanguageState(detectDeviceLanguage())
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false))
  }, [])

  const setLanguage = useCallback(async (lang: AppLanguage) => {
    setLanguageState(lang)
    try {
      await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    } catch {
      // non-critical
    }
  }, [])

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) =>
      translate(language, key, vars),
    [language],
  )

  const value = useMemo(
    () => ({ language, initializing, setLanguage, t }),
    [language, initializing, setLanguage, t],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
