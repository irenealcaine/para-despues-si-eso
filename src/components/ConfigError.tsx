import { ScrollView, StyleSheet, Text } from "react-native"
import { Screen } from "./Screen"
import { colors } from "../constants/colors"

export function ConfigError() {
  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Configuración faltante</Text>
        <Text style={styles.body}>
          Firebase no está configurado. Copia .env.example a .env y rellena los
          valores de tu proyecto Firebase, luego reinicia la app.
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
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
})
