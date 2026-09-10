import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useState } from "react"
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { AppFooter } from "../components/AppFooter"
import { Button } from "../components/Button"
import { LanguageSelector } from "../components/LanguageSelector"
import { Screen } from "../components/Screen"
import { TextField } from "../components/TextField"
import { colors } from "../constants/colors"
import { layout } from "../constants/layout"
import { useAuth } from "../hooks/useAuth"
import { useLanguage } from "../hooks/useLanguage"
import { useOpenAIKey } from "../hooks/useOpenAIKey"
import type { RootStackParamList } from "../navigation/types"
import { confirmDestructive } from "../utils/confirm"
import { getErrorMessage } from "../utils/errors"

type Props = NativeStackScreenProps<RootStackParamList, "Settings">

export function SettingsScreen({ navigation }: Props) {
  const { user, signOut } = useAuth()
  const { language, t } = useLanguage()
  const { hasApiKey, keyHint, initializing, saveKey, deleteKey } = useOpenAIKey()
  const [apiKeyInput, setApiKeyInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSaveKey = async () => {
    if (saving) return
    setError(null)

    if (!apiKeyInput.trim()) {
      setError(t("enterApiKey"))
      return
    }

    setSaving(true)
    try {
      await saveKey(apiKeyInput)
      setApiKeyInput("")
    } catch (saveError) {
      setError(getErrorMessage(saveError, language))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteKey = () => {
    confirmDestructive(
      t("deleteApiKeyTitle"),
      t("deleteApiKeyMessage"),
      t("delete"),
      () => deleteKey(),
      t("cancel"),
    )
  }

  const handleLogout = () => {
    confirmDestructive(
      t("logoutTitle"),
      t("logoutMessage"),
      t("logout"),
      () => signOut(),
      t("cancel"),
    )
  }

  return (
    <Screen>
      <View style={styles.page}>
        <View style={styles.header}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backPressed]}
          >
            <Text style={styles.backIcon}>←</Text>
            <Text style={styles.backLabel}>{t("back")}</Text>
          </Pressable>
          <Text style={styles.title}>{t("settings")}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("account")}</Text>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.accountEmail}>{user?.email ?? t("sessionUnavailable")}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("language")}</Text>
          </View>
          <LanguageSelector compact />
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("openaiApiKey")}</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  initializing
                    ? styles.dotPending
                    : hasApiKey
                      ? styles.dotActive
                      : styles.dotInactive,
                ]}
              />
              <Text style={styles.statusText}>
                {initializing
                  ? t("checking")
                  : hasApiKey
                    ? t("configured")
                    : t("notConfigured")}
              </Text>
            </View>
            {hasApiKey && keyHint ? (
              <Text style={styles.statusHint}>{keyHint}</Text>
            ) : null}
          </View>

          <TextField
            label={t("apiKeyLabel")}
            value={apiKeyInput}
            onChangeText={setApiKeyInput}
            placeholder="sk-..."
            secureTextEntry
            autoCapitalize="none"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.row}>
            <Button title={t("saveKey")} onPress={handleSaveKey} loading={saving} compact />
            {hasApiKey ? (
              <Button title={t("deleteKey")} onPress={handleDeleteKey} variant="danger" compact />
            ) : null}
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.section}>
          <Button title={t("logout")} onPress={handleLogout} variant="danger" compact />
        </View>

        <AppFooter />
        </ScrollView>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    ...layout.webContent,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 12,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  backPressed: {
    backgroundColor: colors.surfaceAlt,
  },
  backIcon: {
    color: colors.accent,
    fontSize: 16,
    fontFamily: "monospace",
    fontWeight: "700",
  },
  backLabel: {
    color: colors.accent,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  container: {
    padding: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 4,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: colors.success,
  },
  dotInactive: {
    backgroundColor: colors.danger,
  },
  dotPending: {
    backgroundColor: colors.warning,
  },
  statusText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  statusHint: {
    color: colors.textMuted,
    fontSize: 12,
    fontFamily: "monospace",
    marginLeft: 16,
  },
  accountEmail: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 16,
  },
})
