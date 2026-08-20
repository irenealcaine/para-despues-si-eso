import { ScrollView, StyleSheet, Text } from "react-native"
import { Screen } from "./Screen"
import { colors } from "../constants/colors"

export function ConfigError() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configuration missing</Text>
        <Text style={styles.body}>
          Firebase is not configured. Copy .env.example to .env and fill in the
          values of your Firebase project, then restart the app.
        </Text>
      </ScrollView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  body: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
})