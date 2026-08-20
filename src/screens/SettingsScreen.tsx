import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useState } from "react"
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native"
import { AppFooter } from "../components/AppFooter"
import { Button } from "../components/Button"
import { Screen } from "../components/Screen"
import { TextField } from "../components/TextField"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useOpenAIKey } from "../hooks/useOpenAIKey"
import type { RootStackParamList } from "../navigation/types"
import { getErrorMessage } from "../utils/errors"

type Props = NativeStackScreenProps<RootStackParamList, "Settings">

export function SettingsScreen({ navigation }: Props) {
  const { signOut } = useAuth()
  const { hasApiKey, keyHint, initializing, saveKey, deleteKey } = useOpenAIKey()
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveKey = async () => {
    if (saving) return
    setError(null)

    if (!apiKeyInput.trim()) {
      setError("Enter your OpenAI API key.")
      return
    }

    setSaving(true)
    try {
      await saveKey(apiKeyInput)
      setApiKeyInput("")
    } catch (saveError) {
      setError(getErrorMessage(saveError))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = () => {
    Alert.alert(
      "Delete API key",
      "Your OpenAI API key will be removed from this device. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: () => deleteKey() },
      ],
    )
  }

  const handleLogout = () => {
    Alert.alert("Log out", "You will need to log in again to see your links.", [
      { text: "Cancel", style: "cancel" },
      { text: "Log out", style: "destructive", onPress: () => signOut() },
    ])
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OpenAI API key</Text>
          <Text style={styles.status}>
            {initializing
              ? "Checking..."
              : hasApiKey
                ? `API key configured (${keyHint})`
                : "No API key configured."}
          </Text>

          <TextField
            label="API key"
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="sk-..."
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button title="Save API key" onPress={handleSaveKey} loading={saving} />

          {hasApiKey ? (
            <View style={styles.spacer} />
          ) : null}

          {hasApiKey ? (
            <Button title="Delete API key" onPress={handleDeleteKey} variant="danger" />
          ) : null}
        </View>

        <View style={styles.section}>
          <Button title="Log out" onPress={handleLogout} variant="danger" />
        </View>

        <AppFooter />
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  status: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 16,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 12,
  },
  spacer: {
    height: 12,
  },
})