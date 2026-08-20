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

type Props = NativeStackScreenProps<RootStackParamList, "Register">

export function RegisterScreen({ navigation }: Props) {
  const { signUp } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    if (loading) return
    setError(null)

    if (!email.trim() || !password || !confirmPassword) {
      setError("Fill in all the fields.")
      return
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await signUp(email, password)
    } catch (signUpError) {
      setError(getAuthErrorMessage(signUpError))
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
          <Text style={styles.title}>Create account</Text>

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
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
            />
            <TextField
              label="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat your password"
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={handleRegister}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button title="Register" onPress={handleRegister} loading={loading} />
          </View>

          <Button title="I already have an account" onPress={() => navigation.navigate("Login")} variant="secondary" />
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
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  form: {
    gap: 8,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 8,
  },
})