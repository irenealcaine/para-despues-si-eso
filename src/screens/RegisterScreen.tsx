import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "../components/Button"
import { LanguageSelector } from "../components/LanguageSelector"
import { Screen } from "../components/Screen"
import { TextField } from "../components/TextField"
import { colors } from "../constants/colors"
import { layout } from "../constants/layout"
import { useAuth } from "../hooks/useAuth"
import { useLanguage } from "../hooks/useLanguage"
import type { RootStackParamList } from "../navigation/types"
import { getAuthErrorMessage } from "../utils/errors"

type Props = NativeStackScreenProps<RootStackParamList, "Register">

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const { language, t } = useLanguage()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (loading) return
    setError(null)

    if (!email.trim() || !password || !confirmPassword) {
      setError(t("fillAllFields"))
      return
    }

    if (password !== confirmPassword) {
      setError(t("passwordsDontMatch"))
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
    } catch (signUpError) {
      setError(getAuthErrorMessage(signUpError, language))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title} accessibilityRole="header">
              {t("registerTitle")}
            </Text>
          </View>

          <View style={styles.form}>
            <TextField
              label={t("emailLabel")}
              value={email}
              onChangeText={setEmail}
              placeholder={t("emailPlaceholder")}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label={t("passwordLabel")}
              value={password}
              onChangeText={setPassword}
              placeholder={t("passwordPlaceholderRegister")}
              secureTextEntry
              autoCapitalize="none"
            />
            <TextField
              label={t("confirmPasswordLabel")}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder={t("confirmPasswordPlaceholder")}
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleRegister}
            />
            {error ? (
              <Text style={styles.error} accessibilityRole="alert">
                {error}
              </Text>
            ) : null}
            <Button title={t("signUp")} onPress={handleRegister} loading={loading} />
          </View>

          <Button
            title={t("alreadyHaveAccount")}
            onPress={() => navigation.navigate("Login")}
            variant="secondary"
          />

          <LanguageSelector compact />
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
    justifyContent: "center",
    padding: 24,
    gap: 24,
    ...layout.webForm,
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "700",
  },
  form: {
    gap: 4,
  },
  error: {
    color: colors.danger,
    fontSize: 13,
    marginBottom: 8,
  },
})
