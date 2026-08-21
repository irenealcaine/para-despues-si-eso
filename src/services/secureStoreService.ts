import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

const OPENAI_API_KEY = "openai_api_key"
const isWeb = Platform.OS === "web"

export const openAIKeyStore = {
  async get(): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(OPENAI_API_KEY)
    }
    return SecureStore.getItemAsync(OPENAI_API_KEY)
  },
  async set(key: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(OPENAI_API_KEY, key)
      return
    }
    return SecureStore.setItemAsync(OPENAI_API_KEY, key)
  },
  async delete(): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(OPENAI_API_KEY)
      return
    }
    return SecureStore.deleteItemAsync(OPENAI_API_KEY)
  },
}