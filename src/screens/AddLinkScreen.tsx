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
      setError("Introduce una URL.")
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
          <Text style={styles.successTitle}>Enlace guardado</Text>
          <Text style={styles.successSubtitle}>{saved.title}</Text>
          {warning ? <Text style={styles.warning}>{warning}</Text> : null}
          <Button title="Volver al inicio" onPress={() => navigation.goBack()} />
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
          <View style={styles.header}>
            <Text style={styles.title}>Añadir enlace</Text>
            <Text style={styles.subtitle}>
              Pega una URL de YouTube, Instagram o cualquier web.
            </Text>
          </View>

          <View style={styles.form}>
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
                    title="Ir a Ajustes"
                    onPress={() => navigation.navigate("Settings")}
                    variant="secondary"
                    compact
                  />
                ) : null}
              </View>
            ) : null}

            <Button title="Guardar" onPress={handleSave} loading={saving} />
            {saving ? (
              <Text style={styles.processing}>
                Detectando plataforma, obteniendo info...
              </Text>
            ) : null}
          </View>
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
    padding: 20,
    paddingTop: 24,
  },
  header: {
    marginBottom: 20,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
  },
  form: {
    gap: 4,
  },
  errorBox: {
    gap: 8,
    marginBottom: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
  },
  warning: {
    color: colors.warning,
    fontSize: 12,
    marginTop: 4,
  },
  processing: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 4,
    fontFamily: "monospace",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  successTitle: {
    color: colors.success,
    fontSize: 18,
    fontWeight: "700",
  },
  successSubtitle: {
    color: colors.text,
    fontSize: 15,
  },
})
