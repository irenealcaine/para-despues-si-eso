import * as SecureStore from "expo-secure-store"

const OPENAI_API_KEY = "openai_api_key"

export const openAIKeyStore = {
  get(): Promise<string | null> {
    return SecureStore.getItemAsync(OPENAI_API_KEY)
  },
  set(key: string): Promise<void> {
    return SecureStore.setItemAsync(OPENAI_API_KEY, key)
  },
  delete(): Promise<void> {
    return SecureStore.deleteItemAsync(OPENAI_API_KEY)
  },
}