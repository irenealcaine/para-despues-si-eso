import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "../components/Button"
import { Screen } from "../components/Screen"
import { TextField } from "../components/TextField"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import type { RootStackParamList } from "../navigation/types"
import { processAndSaveLink, type ProcessLinkResult } from "../services/linkProcessingService"
import { AppError, getErrorMessage } from "../utils/errors"

type Props = NativeStackScreenProps<RootStackParamList, "AddLink">

export function AddLinkScreen({ navigation }: Props) {
  const { user } = useAuth()
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [needsApiKey, setNeedsApiKey] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState<ProcessLinkResult | null>(null)

  const handleSave = async () => {
    if (saving || !user) return
    setError(null)
    setWarning(null)
    setNeedsApiKey(false)

    if (!url.trim()) {
      setError("Enter a URL.")
      return
    }

    setSaving(true)
    try {
      const result = await processAndSaveLink(url, user.uid)
      setSaved(result)
      if (result.warnings.length > 0) {
        setWarning(result.warnings.join(" "))
      }
    } catch (saveError) {
      setError(getErrorMessage(saveError))
      setNeedsApiKey(
        saveError instanceof AppError && saveError.code === "NO_API_KEY",
      )
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <Screen>
        <View style={styles.center}>
          <Text style={styles.successTitle}>Link saved</Text>
          <Text style={styles.successSubtitle}>{saved.title}</Text>
          {warning ? <Text style={styles.warning}>{warning}</Text> : null}
          <Button title="Back to Home" onPress={() => navigation.goBack()} />
        </View>
      </Screen>
    )
  }

  const isNoApiKeyError = needsApiKey

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Add link</Text>
          <Text style={styles.subtitle}>
            Paste a URL from YouTube, Instagram or any website.
          </Text>

          <TextField
            label="URL"
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            keyboardType="url"
            autoCapitalize="none"
          />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
              {isNoApiKeyError ? (
                <Button
                  title="Go to Settings"
                  onPress={() => navigation.navigate("Settings")}
                  variant="secondary"
                />
              ) : null}
            </View>
          ) : null}

          <Button title="Save" onPress={handleSave} loading={saving} />
          {saving ? (
            <Text style={styles.processing}>
              Detecting platform, getting info and generating title...
            </Text>
          ) : null}
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 6,
    marginBottom: 24,
  },
  errorBox: {
    gap: 12,
    marginBottom: 12,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
  },
  warning: {
    color: colors.warning,
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
  },
  processing: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 16,
  },
  successTitle: {
    color: colors.success,
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  successSubtitle: {
    color: colors.text,
    fontSize: 16,
    textAlign: "center",
  },
})