import type { NativeStackScreenProps } from "@react-navigation/native-stack"
import { useState } from "react"
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native"
import { Button } from "../components/Button"
import { Screen } from "../components/Screen"
import { TextField } from "../components/TextField"
import { colors } from "../constants/colors"
import { useAuth } from "../hooks/useAuth"
import type { RootStackParamList } from "../navigation/types"
import { getAuthErrorMessage } from "../utils/errors"

type Props = NativeStackScreenProps<RootStackParamList, "Login">

export function LoginScreen({ navigation }: Props) {
  const { signIn } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (loading) return
    setError(null)

    if (!email.trim() || !password) {
      setError("Enter your email and password.")
      return
    }

    setLoading(true)
    try {
      await signIn(email, password)
    } catch (signInError) {
      setError(getAuthErrorMessage(signInError))
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
            <Text style={styles.title}>para-despues</Text>
            <Text style={styles.subtitle}>Save links to read later</Text>
          </View>

          <View style={styles.form}>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Your password"
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Login" onPress={handleLogin} loading={loading} />
          </View>

          <Button
            title="Create an account"
            onPress={() => navigation.navigate("Register")}
            variant="secondary"
          />
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
  },
  header: {
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: -0.3,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
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
