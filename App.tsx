import { ShareIntentProvider } from "expo-share-intent"
import { StatusBar } from "expo-status-bar"
import { SafeAreaProvider } from "react-native-safe-area-context"
import { ConfigError } from "./src/components/ConfigError"
import { isFirebaseConfigured } from "./src/firebase/config"
import { AuthProvider } from "./src/hooks/useAuth"
import { LanguageProvider } from "./src/hooks/useLanguage"
import { OpenAIKeyProvider } from "./src/hooks/useOpenAIKey"
import { PendingLinkProvider } from "./src/hooks/usePendingLink"
import { ShareIntentHandler } from "./src/hooks/useShareIntentHandler"
import { RootNavigator } from "./src/navigation/RootNavigator"

export default function App() {
  return (
    <ShareIntentProvider options={{ debug: false, resetOnBackground: true }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <AuthProvider>
            <OpenAIKeyProvider>
              <PendingLinkProvider>
                <StatusBar style="light" />
                {isFirebaseConfigured() ? (
                  <>
                    <RootNavigator />
                    <ShareIntentHandler />
                  </>
                ) : (
                  <ConfigError />
                )}
              </PendingLinkProvider>
            </OpenAIKeyProvider>
          </AuthProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </ShareIntentProvider>
  )
}